import clsx from 'clsx';

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover', sizes[size], className)}
        style={{ border: '2px solid var(--beige-border)' }}
      />
    );
  }

  return (
    <div
      className={clsx('rounded-full flex items-center justify-center font-bold text-white', sizes[size], className)}
      style={{
        background: 'var(--cyan)',
        fontFamily: "'Space Grotesk', sans-serif",
        border: '2px solid var(--beige-border)',
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
