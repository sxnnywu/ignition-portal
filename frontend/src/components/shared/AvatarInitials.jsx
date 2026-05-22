import './AvatarInitials.css';

export default function AvatarInitials({ name, size = 36 }) {
  const parts = (name || '').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] || '?').toUpperCase();

  return (
    <span
      className="avatar-initials"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
