// tests/unit/components/shared/DataTable.test.tsx
import DataTable from '@/components/shared/DataTable'; // ← Fixed: default import
import { render, screen } from '@testing-library/react';

const mockColumns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
];

const mockData = [
  { id: '1', name: 'Alice', role: 'TEACHER' },
  { id: '2', name: 'Bob', role: 'STUDENT' },
];

describe('DataTable Component', () => {
  it('should render table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('TEACHER')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});