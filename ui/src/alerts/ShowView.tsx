import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { AlertUser, EnhanceAlert } from '../types/index'
import { ALERTS } from '../mock';
import Grid from '@mui/material/Grid2';
import { Avatar, Card, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import styled from '@emotion/styled'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckIcon from '@mui/icons-material/Check';
import { useDispatch, useSelector } from 'react-redux';
import { alertNotSafe, alertSafe, alertWaiting, initAlert } from '../store/alertSlice';
import { enhanceAlert } from './services';

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
  console.log(`🤠 -> UsersList -> users:`, users);
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
  const alert: EnhanceAlert = useSelector((state: any) => state.alert)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initAlert(enhanceAlert(ALERTS[0])))
  }, [])

  return (
    <div>
      <Button onClick={() => dispatch(alertWaiting(alert.pending_users[0]))}>Move waiting</Button>
      <Button onClick={() => dispatch(alertNotSafe(alert.pending_users[0]))}>Move not safe</Button>
      <Button onClick={() => dispatch(alertSafe(alert.pending_users[0]))}>Move safe</Button>

      <Grid container spacing={2}>
        <Grid size={4}>
          <UsersList severity={WAITING} title="In progress" users={alert.pending_users} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={NOT_SAFE} title="Not Safe" users={alert.not_safe_users} />
        </Grid>

        <Grid size={4}>
          <UsersList severity={SAFE} title="Not Safe" users={alert.safe_users} />
        </Grid>
      </Grid>
    </div>
  )
}

export default memo(ShowView);
