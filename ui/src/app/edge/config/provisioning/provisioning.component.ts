import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { format } from 'date-fns';

import { Edge } from '../../../shared/edge/edge';
import { Websocket } from '../../../shared/shared';
import { DefaultTypes } from '../../../shared/service/defaulttypes';
import { DefaultMessages } from '../../../shared/service/defaultmessages';
import { FormGroup, FormBuilder } from '../../../../../node_modules/@angular/forms';


interface TitleView {
  type: 'title';
}

interface InputView {
  type: 'input';
  id: string;
  text: string;
  default?: string;
}

type View = TitleView | InputView;

@Component({
  selector: 'provisioning',
  templateUrl: './provisioning.component.html'
})
export class ProvisioningComponent implements OnInit {

  public edge: Edge = null;
  private stopOnDestroy: Subject<void> = new Subject<void>();

  private listAll: DefaultTypes.ProvisioningListAllElement[] = [];
  private view: View[] = [];
  private form: FormGroup = this.formBuilder.group({});

  constructor(
    private route: ActivatedRoute,
    private websocket: Websocket,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.websocket.setCurrentEdge(this.route)
      .takeUntil(this.stopOnDestroy)
      .subscribe(edge => {
        this.edge = edge;

        if (edge != null) {
          this.edge.sendQueryMessage(DefaultMessages.provisioningListAll(edge.edgeId)).then(reply => {
            this.listAll = (reply.provisioning as DefaultTypes.ProvisioningListAll).elements;
          });
        }
      });
  }

  public selectElement(element: DefaultTypes.ProvisioningListAllElement) {
    this.edge.sendQueryMessage(DefaultMessages.provisioningWizard(this.edge.edgeId, element.id)).then(reply => {
      this.view = (reply.provisioning as DefaultTypes.ProvisioningWizard).view;
      let controlsConfig: { [key: string]: any } = {};
      for (let view of this.view) {
        if (view.type === 'input') {
          let control = this.formBuilder.control(view.default ? view.default : '');
          view['_form'] = control;
          controlsConfig[view.id] = control;
        }
      }
      this.form = this.formBuilder.group(controlsConfig);
    });
  }

  public send() {
    console.log(this.form.value);
  }
}