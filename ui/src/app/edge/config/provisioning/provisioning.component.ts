import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { format } from 'date-fns';

import { Edge } from '../../../shared/edge/edge';
import { Websocket } from '../../../shared/shared';
import { DefaultTypes } from '../../../shared/service/defaulttypes';
import { DefaultMessages } from '../../../shared/service/defaultmessages';

@Component({
  selector: 'provisioning',
  templateUrl: './provisioning.component.html'
})
export class ProvisioningComponent implements OnInit {

  public edge: Edge = null;
  private stopOnDestroy: Subject<void> = new Subject<void>();

  private listAll: DefaultTypes.ProvisioningListAllElement[] = [];

  constructor(
    private route: ActivatedRoute,
    private websocket: Websocket,
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
      console.log((reply.provisioning as DefaultTypes.ProvisioningWizard).mode);
    });
  }
}