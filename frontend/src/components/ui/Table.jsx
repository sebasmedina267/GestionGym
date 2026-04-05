export default function Table({ columns = [], data = [], renderRow }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const headers = columns.map((col) =>
    typeof col === "string" ? col : col.label
  );

  if (!hasData) {
    return (
      <div className="clientes-table">
        <div className="empty-state">
          <div className="empty-icon">--</div>
          <h3>No hay datos</h3>
          <p>No se encontraron registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-table">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {headers.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {renderRow
              ? data.map((row) => renderRow(row))
              : data.map((row, index) => (
                  <tr key={row?.id ?? index}>
                    {columns.map((col) => {
                      if (typeof col === "string") {
                        return <td key={col}>{row[col]}</td>;
                      }

                      const value = row[col.key];
                      return (
                        <td key={col.key}>
                          {col.render ? col.render(value, row) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
