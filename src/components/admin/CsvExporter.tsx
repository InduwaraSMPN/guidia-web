import React, { useMemo } from 'react';
import CsvDownloader from 'react-csv-downloader';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface Column {
  id: string;
  header: string;
}

interface CsvExporterProps {
  data: any[];
  columns: Column[];
  tableName: string;
  isLoading?: boolean;
}

export const CsvExporter: React.FC<CsvExporterProps> = ({
  data,
  columns,
  tableName,
  isLoading = false,
}) => {
  const formattedDate = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  const filename = `${tableName}-data-${formattedDate}.csv`;

  const datas = useMemo(() => {
    return data.map(row => {
      const formattedRow: Record<string, any> = {};
      columns.forEach(column => {
        formattedRow[column.header] = row[column.id];
      });
      return formattedRow;
    });
  }, [data, columns]);

  return (
    <CsvDownloader
      datas={datas}
      filename={filename}
      extension=".csv"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading || data.length === 0}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </CsvDownloader>
  );
};
