import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Alert } from '../types/index'
import { ALERTS } from '../mock';
import Grid from '@mui/material/Grid2';
import { Card } from '@mui/material';


const ShowView = () => {
  const routeParams = useParams();
  const [alert, setAlert] = useState<Alert>(ALERTS[0]);

  return (
    <div>

      <Grid container spacing={2}>
        <Grid size={4}>
          <Card>
            { alert.missing }
          </Card>

          <h2>Missing Info</h2>
          <ul>
            <li>{ alert.missing }</li>
          </ul>
        </Grid>

        <Grid size={4}>
          <Card>
            { alert.not_safe }
          </Card>
          <h2>Not Safe</h2>
          <ul>
            <li>{ alert.not_safe }</li>
          </ul>
        </Grid>

        <Grid size={4}>
          <Card>
            { alert.safe }
          </Card>

          <h2>Safe</h2>
          <ul>
            <li>{ alert.safe }</li>
          </ul>
        </Grid>
      </Grid>
    </div>
  )
}

export default ShowView;
