import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/roles.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /admin/stats
router.get('/stats',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      // Status breakdown
      const statusBreakdown = await Application.aggregate([
        { $match: { status: { $ne: 'draft' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const statusCounts = {
        submitted: 0,
        under_review: 0,
        accepted: 0,
        waitlisted: 0,
        rejected: 0,
      };
      let totalNonDraft = 0;
      for (const s of statusBreakdown) {
        if (statusCounts.hasOwnProperty(s._id)) {
          statusCounts[s._id] = s.count;
        }
        totalNonDraft += s.count;
      }

      // Reviewer coverage — count reviews per submitted+ application
      const coverageData = await Application.aggregate([
        { $match: { status: { $nin: ['draft'] } } },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'applicationId',
            as: 'reviews'
          }
        },
        {
          $project: {
            reviewCount: { $size: '$reviews' }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: ['$reviewCount', 0] }, then: 'none' },
                  { case: { $eq: ['$reviewCount', 1] }, then: 'partial' },
                ],
                default: 'full'
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const reviewerCoverage = { full: 0, partial: 0, none: 0 };
      for (const c of coverageData) {
        reviewerCoverage[c._id] = c.count;
      }

      res.status(200).json({
        statusCounts,
        reviewerCoverage,
        totalApplications: totalNonDraft,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /admin/applications
router.get('/applications',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const { status, search, sort = 'submittedAt', order = 'desc' } = req.query;

      const pipeline = [];

      // Exclude drafts by default
      const matchStage = { status: { $ne: 'draft' } };
      if (status && status !== 'all') {
        matchStage.status = status;
      }
      pipeline.push({ $match: matchStage });

      // Lookup user info
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      });
      pipeline.push({ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } });

      // Search by user name or email
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { 'user.name': { $regex: search, $options: 'i' } },
              { 'user.email': { $regex: search, $options: 'i' } },
            ]
          }
        });
      }

      // Lookup reviews for score + count
      pipeline.push({
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'applicationId',
          as: 'reviews'
        }
      });

      // Compute avgScore and reviewCount
      pipeline.push({
        $addFields: {
          reviewCount: { $size: '$reviews' },
          avgScore: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $round: [{ $avg: '$reviews.totalScore' }, 0] },
              else: null
            }
          }
        }
      });

      // Sort
      const sortField = sort === 'score' ? 'avgScore' : sort === 'status' ? 'status' : 'submittedAt';
      const sortOrder = order === 'asc' ? 1 : -1;
      pipeline.push({ $sort: { [sortField]: sortOrder } });

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Application.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // Paginate
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Project final shape
      pipeline.push({
        $project: {
          _id: 1,
          status: 1,
          answers: 1,
          submittedAt: 1,
          createdAt: 1,
          'user.name': 1,
          'user.email': 1,
          'user._id': 1,
          reviewCount: 1,
          avgScore: 1,
        }
      });

      const applications = await Application.aggregate(pipeline);

      res.status(200).json({
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /admin/export-csv
router.get('/export-csv',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { status, search } = req.query;

      const pipeline = [];
      const matchStage = { status: { $ne: 'draft' } };
      if (status && status !== 'all') {
        matchStage.status = status;
      }
      pipeline.push({ $match: matchStage });

      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      });
      pipeline.push({ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } });

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { 'user.name': { $regex: search, $options: 'i' } },
              { 'user.email': { $regex: search, $options: 'i' } },
            ]
          }
        });
      }

      pipeline.push({
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'applicationId',
          as: 'reviews'
        }
      });

      pipeline.push({
        $addFields: {
          reviewCount: { $size: '$reviews' },
          avgScore: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $round: [{ $avg: '$reviews.totalScore' }, 0] },
              else: null
            }
          }
        }
      });

      pipeline.push({ $sort: { submittedAt: -1 } });

      const applications = await Application.aggregate(pipeline);

      const escCsv = (val) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = ['ID', 'Name', 'Email', 'School', 'Status', 'Avg Score', 'Reviews', 'Submitted Date'];
      const rows = applications.map(app => [
        escCsv(app._id),
        escCsv(app.user?.name),
        escCsv(app.user?.email),
        escCsv(app.answers?.institution || ''),
        escCsv(app.status),
        escCsv(app.avgScore ?? '--'),
        escCsv(app.reviewCount),
        escCsv(app.submittedAt ? new Date(app.submittedAt).toISOString().split('T')[0] : ''),
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /admin/users
router.get('/users',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const { role, search } = req.query;

      const matchStage = {};
      if (role && role !== 'all') {
        matchStage.role = role;
      }
      if (search) {
        matchStage.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await User.countDocuments(matchStage);

      const users = await User.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'reviewerId',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            appsReviewed: { $size: '$reviews' }
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            appsReviewed: 1,
            createdAt: 1,
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      res.status(200).json({
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /admin/users
router.post('/users',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const validRoles = ['applicant', 'reviewer', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ message: 'A user with this email already exists' });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        password,
      });

      res.status(201).json({
        message: 'User created',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /admin/users/:id/role
router.put('/users/:id/role',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      if (id === req.user.userId) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }

      const validRoles = ['applicant', 'reviewer', 'admin'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      res.status(200).json({
        message: 'User role updated',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /admin/users/:id
router.delete('/users/:id',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      if (id === req.user.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await Review.deleteMany({ reviewerId: user._id });
      await Application.deleteMany({ userId: user._id });
      await User.findByIdAndDelete(id);

      res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
