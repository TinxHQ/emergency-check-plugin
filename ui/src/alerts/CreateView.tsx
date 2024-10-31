import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AlertUser, EnhanceAlert } from '../types/index'
import Grid from '@mui/material/Grid2';
import { Avatar, Button, Card, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import styled from '@emotion/styled'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckIcon from '@mui/icons-material/Check';
import { useDispatch, useSelector } from 'react-redux';
import { alertNotSafe, alertSafe, alertWaiting, initAlert } from '../store/alertSlice';
import * as Emergency  from '../models/Emergency';

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

const CreateView = () => {
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();

    const response = await Emergency.create();
    console.log(`🤠 -> handleClick -> response:`, response);

    navigate(`/alerts/${response.uuid}`)
  }

  return (
    <div>
      <img className="random" src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmFobmxsdWx2a3p6bms5emdhajJsczR1MGN0M29oczk2b3Z4bGVuciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nrXif9YExO9EI/giphy.webp" />
      <img className="random" src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDNyYmhkeTJ2MGpnOHZiNDFoMGYycjdvbGVjOTFiZTMyMnV6czhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/12zgyJya7QwQKI/giphy.webp" />
      <img className="random" src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpOW82ZmV3NHQwZzY3enpxdmxxYjFoeXF5M2x6cTY0ejI0MWFydSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yfEjNtvqFBfTa/giphy.webp" />
      <img className="random" src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjlibHJ5eDZrNWllZXpldXlwY3VxaDRmYnFudDhuOWhmYWt4Y3ZvbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RMMeeIsWtwNlLBwtCX/giphy.webp" />
      <img className="random" src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTRzZW9xeHF4djczbDJ5eTNrODB0b3dqZ3QwMGE4ZXl4eHYyMDIzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Lopx9eUi34rbq/giphy.webp" />
      <img className="random" src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWczeTh4c2N6b2JlYng0M3VraGw2aGk0a2N0cmZ4cnU4ZG12ZDh4NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3JDnePt8MlFnFApq/giphy.webp" />

      <Card elevation={10} sx={{ margin: '100px auto 0', width: 500, padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 9999 }}>
        <h1><span className='fire'>🔥</span> Emergency Alert <span className='fire'>🔥</span></h1>

        <Button onClick={handleClick} color="error" variant="contained" size="large">SEND THE ALERT TO EVERYONE</Button>
      </Card>
    </div>
  )
}

export default memo(CreateView);
