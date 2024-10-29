import React from 'react';

import { RouteObject, } from "react-router-dom";
import ListView from "./alerts/ListView";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <ListView />,
  },
];

export default routes;
