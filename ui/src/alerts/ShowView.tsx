import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Alert, AlertUser } from '../types/index'
import { ALERTS } from '../mock';
import Grid from '@mui/material/Grid2';
import { Avatar, Card, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import styled from '@emotion/styled'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckIcon from '@mui/icons-material/Check';

const CardColored = styled(Card)(`
  font-size: 30px;
  text-align: center;
  padding: 40px 20px;
  font-weight: bold;
`)

const ListTitle = styled((props: Record<string, any>) => <Typography {...props} variant="h2" />)(`
  font-size: 1rem;
  margin-bottom: 5px;
`);

const WAITING = 'waiting';
const NOT_SAFE = 'not_safe';
const SAFE = 'safe';

type Props = {
  title: string;
  severity: typeof WAITING | typeof NOT_SAFE | typeof SAFE;
  users: AlertUser[];
}

const getColor = (severity: Props['severity']) => {
  switch (severity) {
    case WAITING:
      return grey[200];
    case NOT_SAFE:
      return red[200];
    case SAFE:
      return green[200];
  }
}

const getIcon = (severity: Props['severity']) => {
  switch (severity) {
    case WAITING:
      return AccessTimeIcon;
    case NOT_SAFE:
      return DangerousIcon;
    case SAFE:
      return CheckIcon;
  }
}

const UsersList = ({ title, severity, users }: Props) => {
  const color = getColor(severity);
  console.log(`🤠 -> UsersList -> color:`, color);
  const Icon = getIcon(severity);
  console.log(`🤠 -> UsersList -> Icon:`, Icon);

  return (
    <>
      <CardColored sx={{ background: color }}>
        <ListTitle>{ title }</ListTitle>
        { users.length }
      </CardColored>


      <List>
        { users.map(({ uuid, firstname, lastname }: AlertUser) => {
          return (
            <div key={uuid}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ background: color }}>
                    <Icon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{ [firstname, lastname].filter(Boolean).join(' ') }</ListItemText>
              </ListItem>
              <Divider />
            </div>
          )
        })}
      </List>

    </>
  )
}

const ShowView = () => {
  const routeParams = useParams();
  const [alert, setAlert] = useState<Alert>(ALERTS[0]);

  return (
    <div>

      <Grid container spacing={2}>
        <Grid size={4}>
          <UsersList severity={WAITING} title="In progress" users={alert.missing} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={NOT_SAFE} title="Not Safe" users={alert.not_safe} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={SAFE} title="Not Safe" users={alert.safe} />
        </Grid>
      </Grid>
    </div>
  )
}

export default ShowView;
