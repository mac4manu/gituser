import {Component} from 'angular2/core';
import {ControlGroup, FormBuilder} from 'angular2/common';
import {Observable} from 'rxjs/Rx';
import {OnInit} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';

import {GitHubService} from './services/github.service';

@Component({
    selector: 'git-app',
    templateUrl: './app/github-template.html',
    providers: [HTTP_PROVIDERS, GitHubService]
})

export class AppComponent implements OnInit {
    form: ControlGroup;
    username;
    user = {};
    followers = [];
    isLoading = false;
    notFound = false;
    error;
    constructor(fb: FormBuilder, private _gitHubService: GitHubService) {
        this.form = fb.group({
            search: []
        });
    }
    ngOnInit() {
        var search = this.form.find('search');
        search.valueChanges //this returns Observable
            .debounceTime(400)
            .map(str => {
                this.user = {};
                this.followers = [];
                this.isLoading = true;
                return <string>str;
            })
            .subscribe(x => {
                this.username = x;
                Observable
                    .forkJoin(
                    this._gitHubService.getUserInfo(this.username),
                    this._gitHubService.getFollowerInfo(this.username)
                    )
                    .subscribe(res => {
                        this.isLoading = false;
                        this.notFound = false;
                        this.user = res[0];
                        this.followers = res[1];
                    }, error => {
                        this.isLoading = false;
                        this.notFound = true;
                    });
            });
    }
}