import { Routes } from '@angular/router';
import { HomeComponent } from './components/page/home/home.component';
import { LeaderboardComponent } from './components/page/leaderboard/leaderboard.component';
import { DiscoverComponent } from './components/page/discover/discover.component';
import { CreatevocablistComponent } from './components/page/myvocabpage/createvocablist/createvocablist.component';
import { MyVocabSpaceComponent } from './components/page/myvocabpage/myvocabspace/myvocabspace.component';
import { FlipcardgameComponent } from './components/game/flipcardgame/flipcardgame.component';
import { WordsearchgameComponent } from './components/game/wordsearchgame/wordsearchgame.component';
import { FlipcardstartComponent } from './components/game/flipcardstart/flipcardstart.component';
import { WordsearchstartComponent } from './components/game/wordsearchstart/wordsearchstart.component';
import { PrehomeComponent } from './components/prelogin/prehome/prehome.component';
import { RegisterComponent } from './components/prelogin/register/register.component';
import { LoginComponent } from './components/prelogin/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { UserprofileComponent } from './components/page/userprofile/userprofile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuard } from './guards/admin.guard';
import { WordsetSearchComponent } from './components/wordset-search/wordset-search.component';
import { ForgotpassComponent } from './components/prelogin/forgotpass/forgotpass.component';
import { ReportComponent } from './components/page/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  //#region admin
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard]},
  //#endregion
  //#region prelogin
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
  { path: 'welcome', component: PrehomeComponent},
  { path: 'forgotpass', component: ForgotpassComponent},
  //#endregion
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'myvocabspace', component: MyVocabSpaceComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'discover', component: DiscoverComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserprofileComponent, canActivate: [AuthGuard] },
  { path: 'wordset-search', component: WordsetSearchComponent, canActivate: [AuthGuard] },
  //#region myvocabspace    
  { path: 'myvocabspace/create', component: CreatevocablistComponent, canActivate: [AuthGuard] },
  { path: 'myvocabspace/edit/:word_set_id', component: CreatevocablistComponent, canActivate: [AuthGuard] },
  //#endregion
  //#region flipcardgame
  { path: 'flipcardgame/:word_set_id', component: FlipcardstartComponent, canActivate: [AuthGuard] },
  { path: 'flipcardgame/:word_set_id/:game_mode_id', component: FlipcardgameComponent, canActivate: [AuthGuard] },
  //#endregion
  //#region wordsearchgame
  { path: 'wordsearchgame/:word_set_id', component: WordsearchstartComponent, canActivate: [AuthGuard] },
  { path: 'wordsearchgame/:word_set_id/:game_mode_id', component: WordsearchgameComponent, canActivate: [AuthGuard] },
  //#endregion
  { path: 'report', component: ReportComponent, canActivate: [AuthGuard] },
];
