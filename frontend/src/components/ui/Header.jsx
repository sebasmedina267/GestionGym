export default function Header({ title, children }) {
  return (
    <div className="clientes-header">
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  );
}
