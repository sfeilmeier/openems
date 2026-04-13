import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Category } from "./category";

export type ComponentData = {
    label: string;
    value: any;
    default?: boolean;
    imageUrl?: string;
    docUrl?: string;
};

export type SerialNumberFormData = {
    formTower: FormGroup;
    fieldSettings: FormlyFieldConfig[];
    model: any;
    header: string;
};

export type TableData = {
    header: Category;
    rows: ComponentData[]
};

export type DcPv = {
    isSelected: boolean,
    alias?: string,
    value?: number,
    orientation?: string,
    moduleType?: string,
    modulesPerString?: number,
    portsConnected?: boolean,
};

export type DcForm = {
    formGroup: FormGroup<any>;
    fields: FormlyFieldConfig[];
    model: any;
};

export type EmsType = "feh013" | "fho011" | "fec011" | "fec013" | null;

export enum ExtensionBoxPrefix {
    FHP = "FHP",
    FCP = "FCP",
    FEE = "FEE",
    FHA = "FHA",
    FCP1 = "FCP1",
    FHE = "FHE",
}
