interface LoadingProps {
  text?: string;
}

function Loading({ text = "Yükleniyor..." }: LoadingProps) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />

      <span>{text}</span>
    </div>
  );
}

export default Loading;
