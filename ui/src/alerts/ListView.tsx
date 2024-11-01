import { useEffect, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate, Link } from 'react-router-dom';
import type { EnhanceAlert } from '../types/index'
import { CircularProgress, IconButton } from '@mui/material';
import * as Emergency  from '../models/Emergency';

const ListView = () => {
  const [rows, setRows] = useState<EnhanceAlert[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Emergency.all().then(setRows);
  }, [])

  if(!rows) {
    return <CircularProgress size={120} />
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Status</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Originator</TableCell>
          <TableCell>⌛ Pending</TableCell>
          <TableCell>🔴 Not Safe</TableCell>
          <TableCell>🟢 Safe</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows?.map((row) => (
          <TableRow
            key={row.uuid}
            sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            onClick={() => navigate(`/alerts/${row.uuid}`)}
          >
            <TableCell>{row.status}</TableCell>
            <TableCell>{ row.emergency_type === 'fire' && '🔥 '}{ row.emergency_type }</TableCell>
            <TableCell>{row.originator}</TableCell>
            <TableCell>{row?.pending_users?.length || 0}</TableCell>
            <TableCell>{row?.not_safe_users?.length || 0}</TableCell>
            <TableCell>{row?.safe_users?.length || 0}</TableCell>
            <TableCell><IconButton component={Link} to={`/alerts/${row.uuid}`}><EditIcon /></IconButton></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ListView;
