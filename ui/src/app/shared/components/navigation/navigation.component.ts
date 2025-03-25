// @ts-strict-ignore

import { Directive, effect, signal, WritableSignal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { PreviousRouteService } from "../../service/previousRouteService";
import { Service } from "../../shared";
import { Icon } from "../../type/widget";
import { ObjectUtils } from "../../utils/object/object.utils";

// @Component({
//     selector: "oe-navigation",
//     templateUrl: "./navigation.component.html",
//     standalone: false,
// })
// export class NavigationComponent {

//     protected children: Signal<NavigationTree[]> = computed(() => this.navigationService.children());
//     protected parents: Signal<NavigationTreeWithoutChildren[]> = computed(() => this.navigationService.breadCrumbs());
//     protected isCurrentRouteInNavigationTreeAndHasChildren = true;

//     // protected navigationTree: NavigationTree | null = null;
//     // protected currentForwardNavigations: NavigationTree[] | null = null;
//     // protected currentUrl: string | null = null;
//     // protected isCurrentRouteInNavigationTreeAndHasChildren: boolean = true;
//     // protected breadCrumbs: WritableSignal<NavigationTreeWithoutChildren[]> = signal([]);

//     constructor(
//         public navigationService: NavigationService,
//         public service: Service,
//         // private previousRouteS: PreviousRouteService,
//         private router: Router,
//     ) {

//         effect(() => {

//             // this.children = this.navigationService.children();
//         });

//         // effect(() => {
//         //     const some = this.navigationService.navigationTree();
//         //     const topLevelPath = this.navigationService.currentUrl();
//         //     const currentParent = this.navigationService.currentParent();

//         //     if (currentParent) {
//         //         this.breadCrumbs.set(this.navigationService.findAllIdsByLabel(some, currentParent.id, []));
//         //     }

//         //     // const breadCrumbs = this.navigationService.findAllIdsByLabel(some, NavigationId.EVSE, []);
//         //     console.log("🚀 ~ NavigationComponent ~ effect ~ some2:", this.breadCrumbs())


//         // })
//     }

//     /**
//      * Routes to passed route
//      *
//      * @param link the relative link
//      */
//     some3(link: string) {
//         const currentNav = NavigationUtils.getNavigationTreeFromRouterLink(this.navigationService.wholeNavi(), link);
//         const segments = this.navigationService.currentUrl().split("/");
//         const segments2 = link.split("/");
//         this.navigationService.currentNode.set(currentNav);
//         this.router.navigate([...segments, ...segments2]);
//     }

// }

@Directive()
export class NavigationService {

    public currentUrl: WritableSignal<null | string> = signal(null);
    public currentNode: WritableSignal<NavigationTree | null> = signal(null);
    public wholeNavi: WritableSignal<NavigationTree> = signal(baseNavigationTree);
    public children: WritableSignal<NavigationTree[]> = signal(null);
    public breadCrumbs: WritableSignal<NavigationTreeWithoutChildren[]> = signal(null);

    constructor(
        private router: Router,
        private service: Service,
        private previosRouteService: PreviousRouteService,
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentUrl.set(event.urlAfterRedirects);
            }
        });

        effect(() => {
            const wholeNavi = this.wholeNavi();
            router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                    this.currentUrl.set(event.urlAfterRedirects);
                }
            });
            const topLevelSegment = this.currentUrl().split("/").pop();
            this.currentNode.set(NavigationUtils.getNavigationTreeFromRouterLink(wholeNavi, topLevelSegment));
            this.children.set(this.currentNode()?.children ?? []);
            const navigationTreeWithoutChildren: NavigationTreeWithoutChildren = ObjectUtils.excludeProperties(this.currentNode(), ["children"]);
            this.breadCrumbs.set([...NavigationUtils.findAllIdsByLabel(wholeNavi, this.currentNode()?.id), navigationTreeWithoutChildren]);
        });
    }

    public addChild(parentNavigationId: NavigationId, newChildNavigation: NavigationTree) {
        this.wholeNavi.set(NavigationUtils.setChildNavigationTree(this.wholeNavi(), parentNavigationId, newChildNavigation));
    }

    public addChildren(parentNavigationId: NavigationId, newChildNavigation: NavigationTree[]) {
        for (const navi of newChildNavigation) {
            this.wholeNavi.set(NavigationUtils.setChildNavigationTree(this.wholeNavi(), parentNavigationId, navi));
        }
    }

    public setWholeNavi(wholeNavi: NavigationTree) {
        this.wholeNavi.set(wholeNavi);
    }


}


export namespace NavigationUtils {

    export function getNavigationTreeFromRouterLink(tree: NavigationTree, routerLink: string): NavigationTree | null {

        if (tree?.routerLink === routerLink) { // Adjusting children when navigation is found
            return tree;
        }

        if (tree?.children?.length > 0) {
            for (const child of tree.children) {
                const result = getNavigationTreeFromRouterLink(child, routerLink);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    export function setChildNavigationTree(wholeNavi: NavigationTree, navigationId: NavigationId, childNavigationTree: NavigationTree): NavigationTree {
        return this.updateNavigationTree(wholeNavi, navigationId, childNavigationTree);
        // this.currentParent.set(this.navigationTree())
        // this.currentChildren.set(this.getChildren());
        // console.log("🚀 ~ NavigationService ~ setChildNavigationTree ~ this.currentChildren:", this.currentChildren(), this.currentParent(), this.navigationTree())
        // debugger;
    }

    export function updateNavigationTree(tree: NavigationTree, navigationId: NavigationId, newNavigation: NavigationTree) {

        if (!tree) {
            return;
        }

        if (tree?.id === navigationId) {

            // Initialize
            tree.children ??= [];

            const currentChildren = tree.children.map(child => child.id == navigationId ? newNavigation : child);
            tree.children = currentChildren.length > 0 ? currentChildren : [newNavigation];
            return tree;
        }

        if (tree.children.length > 0) {
            for (const child of tree.children) {
                const result = this.updateNavigationTree(child, navigationId, newNavigation);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    export function getCurrentNavigationTree(tree: NavigationTree, navigationId: NavigationId): NavigationTree | null {

        if (tree?.id === navigationId) {
            return tree;
        }

        if (tree?.children?.length > 0) {
            for (const child of tree.children) {
                const result = this.getCurrentNavigationTree(child, navigationId);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    export function findAllIdsByLabel(tree: NavigationTree, targetId: NavigationId | string, path: NavigationTreeWithoutChildren[] = []) {

        let results: NavigationTreeWithoutChildren[] = path;

        if (!tree) {
            return results;
        }

        if (tree?.id === targetId) {
            results.push(ObjectUtils.excludeProperties(tree, ["children"]));
            return results;
        }

        if (Array.isArray(tree.children)) {
            for (const child of tree.children) {

                if (child.ignore == true) {
                    continue;
                }
                results = results.concat(this.findAllIdsByLabel(child, targetId, [...path, ObjectUtils.excludeProperties(tree, ["children"])]));
            }
        }

        return results;
    }

    export function findNavigationPath2(
        tree: NavigationTree,
        targetId: NavigationId,
        path: NavigationTreeWithoutChildren[] = []
    ): NavigationTreeWithoutChildren[] | null {

        if (!tree) { return null; }

        // Add current node to the path (excluding children)
        const currentPath = [...path, ObjectUtils.excludeProperties(tree, ["children"])];

        if (tree.id === targetId) {
            return currentPath; // Return the path when the target is found
        }

        if (Array.isArray(tree.children)) {
            for (const child of tree.children) {
                const result = findNavigationPath2(child, targetId, currentPath);
                if (result) { return result; } // If found in child, return immediately
            }
        }

        return null; // Not found in this branch
    }

    /**
 * Recursively finds the path (parent hierarchy) to a given id in the navigation tree.
 */
    export function findNavigationPath(tree: NavigationTree[], targetId: NavigationId): NavigationTree[] | null {
        for (const node of tree) {
            if (node.id === targetId) {
                return [node]; // If the node itself is the target, return it
            }

            if (node.children && node.children.length > 0) {
                const childPath = findNavigationPath(node.children, targetId);
                if (childPath) {
                    return [node, ...childPath]; // Append the current node as a parent
                }
            }
        }
        return tree; // Target ID not found in this subtree
    }
}
@Directive()
export class NavigationService2 {

    public currentUrl: WritableSignal<string | null> = signal(null);
    public navigationTree: WritableSignal<NavigationTree> = signal(baseNavigationTree);
    public currentChildren: WritableSignal<NavigationTree[]> = signal(null);
    public currentParent: WritableSignal<NavigationTree> = signal(null);
    public previousRoute: WritableSignal<string | null> = signal(null);

    constructor(
        private router: Router,
        private service: Service,
        private previosRouteService: PreviousRouteService,
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentUrl.set(event.urlAfterRedirects);
                // this.currentChildren.set(this.getChildren());
            }
        });
    }

    public setChildNavigationTree(navigationId: NavigationId, childNavigationTree: NavigationTree) {
        const newNavigation = this.updateNavigationTree(this.navigationTree(), navigationId, childNavigationTree);
        this.navigationTree.set(newNavigation);
        this.currentParent.set(this.navigationTree());
        // this.currentChildren.set(this.getChildren());
        // console.log("🚀 ~ NavigationService ~ setChildNavigationTree ~ this.currentChildren:", this.currentChildren(), this.currentParent(), this.navigationTree())
        // debugger;
    }

    public removeAllChildrenFromNavigation(navigationId: NavigationId) {
        const newNavigation = this.updateNavigationTree(this.navigationTree(), navigationId, null);
        this.navigationTree.set(newNavigation);
        this.currentParent.set(this.navigationTree());
        // this.currentChildren.set(this.getChildren())
    }

    public updateNavigationTree(tree: NavigationTree, navigationId: NavigationId, newNavigation: NavigationTree) {

        if (!tree) {
            return;
        }

        if (tree?.id === navigationId) {

            // Initialize
            tree.children ??= [];

            const currentChildren = tree.children.map(child => child.id == navigationId ? newNavigation : child);
            tree.children = currentChildren.length > 0 ? currentChildren : [newNavigation];
            return tree;
        }

        if (tree.children.length > 0) {
            for (const child of tree.children) {
                const result = this.updateNavigationTree(child, navigationId, newNavigation);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    public getCurrentNavigationTree(tree: NavigationTree, navigationId: NavigationId | string): NavigationTree | null {

        if (tree?.id === navigationId) {
            return tree;
        }

        if (tree?.children?.length > 0) {
            for (const child of tree.children) {
                const result = this.getCurrentNavigationTree(child, navigationId);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }


    // hasNavigationWithId(tree: NavigationTree, navigationId: NavigationId): boolean {

    //     if (tree?.id === navigationId) { // Adjusting children when navigation is found
    //         return true;
    //     }

    //     if (tree?.children?.length > 0) {
    //         for (const child of tree.children) {
    //             const result = this.hasNavigationWithId(child, navigationId);
    //             if (result) {
    //                 return result;
    //             }
    //         }
    //     }

    //     return false;
    // }

    public getNavigationIdFromRouterLink(tree: NavigationTree, routerLink: string): NavigationId | string | null {

        if (tree?.routerLink === routerLink) { // Adjusting children when navigation is found
            return tree.id;
        }

        if (tree?.children?.length > 0) {
            for (const child of tree.children) {
                const result = this.getNavigationIdFromRouterLink(child, routerLink);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    public getChildren(navigation: NavigationTree): NavigationTree[] {
        const topLevelRoute = this.currentUrl()?.split("/").pop() ?? "";
        // this.previousRoute.set(this.currentUrl()?.split("/"));
        const navigationId = this.getNavigationIdFromRouterLink(navigation, topLevelRoute);
        const currentNavigationTree = this.getCurrentNavigationTree(navigation, navigationId);
        return currentNavigationTree?.children ?? null;
    }

    public some(tree: NavigationTree, id: NavigationId | string, list: (NavigationId | string)[] = []) {
        const some2: (NavigationId | string)[] = list;
        const navigationTree = tree;
        if (navigationTree.id == id) {
            some2.push(navigationTree.id);
            return some2;
        }

        if (navigationTree.children.length > 0) {
            for (const child of navigationTree.children) {
                // if (child.id == )
                some2.push(navigationTree.id);
                this.some(child, id, some2);
            }
        }

        return some2;
    }

    public findAllIdsByLabel(tree: NavigationTree, targetId: NavigationId, path: NavigationTreeWithoutChildren[] = []) {

        let results: NavigationTreeWithoutChildren[] = path;
        if (!tree) {
            return results;
        }

        if (tree?.id === targetId) {
            results.push(ObjectUtils.excludeProperties(tree, ["children"]));
            return results;
        }

        if (Array.isArray(tree.children)) {
            for (const child of tree.children) {
                results = results.concat(this.findAllIdsByLabel(child, targetId, [...path, ObjectUtils.excludeProperties(tree, ["children"])]));
            }
        }

        return results;
    }
}

export enum NavigationId {
    LIVE = "live",
    HISTORY = "history",
}
export const baseNavigationTree: NavigationTree = {
    id: NavigationId.LIVE,
    label: "live",
    routerLink: "live",
    icon: { name: "home-outline" },
    mode: "icon",
    children: [],
};


export type NavigationTree = {
    id: NavigationId | string,
    routerLink: string,
    icon: Pick<Icon, "name">,
    label: string,
    mode: "icon" | "label",
    children: NavigationTree[],
    ignore?: boolean
};

export type NavigationTreeWithoutChildren = Omit<NavigationTree, "children">;
