import React from 'react';
import {
  IonApp, IonIcon, IonLabel,
  IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { homeOutline, home, giftOutline, gift, listOutline, list } from 'ionicons/icons';

import Home         from './pages/Home';
import DonationForm from './pages/DonationForm';
import MyDonations  from './pages/MyDonations';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme */
import './theme/variables.css';
import './App.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home"         component={Home} />
          <Route exact path="/donate"       component={DonationForm} />
          <Route exact path="/my-donations" component={MyDonations} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className="app-tab-bar">
          <IonTabButton tab="home" href="/home">
            <IonIcon ios={homeOutline} md={home} />
            <IonLabel>الرئيسية</IonLabel>
          </IonTabButton>

          <IonTabButton tab="donate" href="/donate" className="tab-donate-btn">
            <div className="tab-donate-bubble">
              <IonIcon ios={giftOutline} md={gift} />
            </div>
            <IonLabel>تبرع</IonLabel>
          </IonTabButton>

          <IonTabButton tab="my-donations" href="/my-donations">
            <IonIcon ios={listOutline} md={list} />
            <IonLabel>تبرعاتي</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
