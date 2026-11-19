interface BusIllustrationProps {
  className?: string;
}

export function BusIllustration({ className = 'w-64 h-auto' }: BusIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KBU Ride orange campus shuttle bus"
      role="img"
    >
      {/* Warm ground shadow */}
      <ellipse cx="160" cy="116" rx="126" ry="10" fill="#592A0E" fillOpacity="0.55" />

      {/* Main orange bus body */}
      <rect x="26" y="12" width="268" height="90" rx="22" fill="#FF7326" />

      {/* Horizontal accent stripe across lower body */}
      <rect x="26" y="76" width="268" height="9" fill="#D95314" />

      {/* Passenger windows (3 rounded dark cutouts) */}
      <rect x="44" y="25" width="54" height="33" rx="8" fill="#171210" />
      <rect x="108" y="25" width="54" height="33" rx="8" fill="#171210" />
      <rect x="172" y="25" width="54" height="33" rx="8" fill="#171210" />

      {/* Larger front windshield / cab window */}
      <rect x="236" y="25" width="44" height="46" rx="9" fill="#171210" />

      {/* Rear wheel */}
      <circle cx="96" cy="100" r="19" fill="#1B1512" />
      <circle cx="96" cy="100" r="7.5" fill="#B5ACA6" />

      {/* Front wheel */}
      <circle cx="226" cy="100" r="19" fill="#1B1512" />
      <circle cx="226" cy="100" r="7.5" fill="#B5ACA6" />
    </svg>
  );
}
