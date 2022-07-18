import React, { useState, useContext, useEffect } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { PageLayout } from "./components/PageLayout";
import { ProfileData } from "./components/ProfileData";
import CalendarsData from './components/CalendarsData'
import { callMsGraph } from "./graph";
import Button from "react-bootstrap/Button";
import "./styles/App.css";
import AppContext from "./AppContext";

/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */
const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [calendarsData, setCalendarsData] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const { readCalendars, setReadCalendars, tokenData, setTokenData } = useContext(AppContext);

  const requestData = loginRequest(readCalendars)

  const getToken = async () => {
    return await instance.acquireTokenSilent({
        ...requestData,
        account: accounts[0],
      });
  }

  const requestProfileData = async () => {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    const responseToken = tokenData || await getToken()

    if(!tokenData) {
        setTokenData(responseToken)
    }

    const profileInfo = await callMsGraph(responseToken.accessToken);
    setGraphData(profileInfo);

    if(readCalendars) {
        const calendarsInfo = await callMsGraph(responseToken.accessToken, true);
        setCalendarsData(calendarsInfo);
    }
  };

  useEffect(() => {
    if(accounts && accounts.length > 0 && !tokenData) {
        getToken().then(token => {
            setTokenData(token)
            setReadCalendars(token.scopes.indexOf('Calendars.Read') > -1)
        })
    } else if(tokenData) {
        setReadCalendars(tokenData.scopes.indexOf('Calendars.Read') > -1)
    }
}, [])

  return (
    <>
      {accounts && accounts.length > 0 && (
        <h5 className="card-title">Welcome {accounts[0].name}</h5>
      )}
      {graphData ? <div>
        <ProfileData graphData={graphData} />
        {calendarsData && <div style={{marginTop: '2em'}}>
            <CalendarsData data={calendarsData}/>
        </div>}
      </div>: (
        <Button variant="secondary" onClick={requestProfileData}>
          Request Profile Information
          {calendarsData && <span style={{marginLeft: '0.25em'}}>and Calendars info</span>}
        </Button>
      )}
    </>
  );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {
  const { readCalendars } = useContext(AppContext);

  return (
    <div className="App">
      <AuthenticatedTemplate>
        <ProfileContent />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <h5 className="card-title">
          Please sign-in to see your profile information
          {readCalendars && (
            <span style={{ marginLeft: ".25em" }}>and your calendars</span>
          )}
        </h5>
      </UnauthenticatedTemplate>
    </div>
  );
};

export default function App() {
  const [readCalendars, setReadCalendars] = useState(undefined);
  const [tokenData, setTokenData] = useState(undefined);

  return (
    <AppContext.Provider value={{ readCalendars, setReadCalendars, tokenData, setTokenData  }}>
      <PageLayout>
        <MainContent />
      </PageLayout>
    </AppContext.Provider>
  );
}
