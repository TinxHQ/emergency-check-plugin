import { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { AlertUser, EnhanceAlert } from '../types/index'
import Grid from '@mui/material/Grid2';
import { Avatar, Card, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import styled from '@emotion/styled'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckIcon from '@mui/icons-material/Check';
import { useDispatch, useSelector } from 'react-redux';
import { initAlert } from '../store/alertSlice';
import * as Emergency  from '../models/Emergency';
import { enhanceAlert } from './services';
import { STATUS_PENDING, STATUS_SAFE, STATUS_UNSAFE } from './contants';

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

type Props = {
  title: string;
  severity: typeof STATUS_PENDING | typeof STATUS_UNSAFE | typeof STATUS_SAFE;
  users: AlertUser[];
}

const getColor = (severity: Props['severity']) => {
  switch (severity) {
    case STATUS_PENDING:
      return grey[200];
    case STATUS_UNSAFE:
      return red[200];
    case STATUS_SAFE:
      return green[200];
  }
}

const getIcon = (severity: Props['severity']) => {
  switch (severity) {
    case STATUS_PENDING:
      return AccessTimeIcon;
    case STATUS_UNSAFE:
      return DangerousIcon;
    case STATUS_SAFE:
      return CheckIcon;
  }
}

const UsersList = ({ title, severity, users }: Props) => {
  const color = getColor(severity);
  const Icon = getIcon(severity);

  return (
    <>
      <CardColored sx={{ background: color }}>
        <ListTitle>{ title }</ListTitle>
        { users?.length || 0 }
      </CardColored>


      <List>
        { users?.map(({ uuid, firstname, lastname }: AlertUser) => {
          return (
            <div key={uuid}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ background: color }}>
                    <Icon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{ [uuid, firstname, lastname].filter(Boolean).join(' ') }</ListItemText>
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
  const alert: EnhanceAlert = useSelector((state: any) => state.alert)
  const dispatch = useDispatch()

  useEffect(() => {
    (async ( ) => {
     if (!routeParams.uuid) {
      // Handle the case where uuid is undefined, such as redirecting to an error page.
      return;
    }

      const response = await Emergency.get(routeParams.uuid);
      dispatch(initAlert(enhanceAlert(response)))
    })()
  }, [])

  return (
    <div>
      <Grid container spacing={2}>
        <Grid size={4}>
          <UsersList severity={STATUS_PENDING} title="In progress" users={alert.pending_users} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={STATUS_UNSAFE} title="Not Safe" users={alert.unsafe_users} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={STATUS_SAFE} title="Safe" users={alert.safe_users} />
        </Grid>
      </Grid>
    </div>
  )
}

export default memo(ShowView);
