import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Link } from 'react-router-dom';
import type { Alert } from '../types/index'
import { ALERTS } from '../mock';


const ListView = () => {
  const [rows, setRows] = useState<Alert>(ALERTS);

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
        {rows.map((row) => (
          <TableRow
            key={row.date}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell>{row.date}</TableCell>
            <TableCell>{row.missing}</TableCell>
            <TableCell>{row.safe}</TableCell>
            <TableCell>{row.not_safe}</TableCell>
            <TableCell><Link to={`/alerts/${row.uuid}`}><EditIcon /></Link></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ListView;
