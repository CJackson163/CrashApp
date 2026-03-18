export default function FlashOverlay({ text, color }) {
  return (
    <div className={`flash-overlay ${color}`}>
      <span>{text}</span>
    </div>
  );
}