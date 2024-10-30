import { useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate, Link } from 'react-router-dom';
import type { Alert } from '../types/index'
import { ALERTS } from '../mock';
import { IconButton } from '@mui/material';


const ListView = () => {
  const [rows, setRows] = useState<Alert[]>(ALERTS);
  const navigate = useNavigate();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Missing</TableCell>
          <TableCell>Safe</TableCell>
          <TableCell>Not Safe</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows?.map((row) => (
          <TableRow
            key={row.date}
            sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            onClick={() => navigate(`/alerts/${row.uuid}`)}
          >
            <TableCell>{row.date}</TableCell>
            <TableCell>{row.missing.length}</TableCell>
            <TableCell>{row.safe.length}</TableCell>
            <TableCell>{row.not_safe.length}</TableCell>
            <TableCell><IconButton LinkComponent={Link} to={`/alerts/${row.uuid}`}><EditIcon /></IconButton></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ListView;
