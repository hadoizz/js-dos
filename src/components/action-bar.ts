
import { html } from "../dom";

import { Icons } from "../icons";
import { Props } from "../player-app";
import { Controls } from "./controls";

export function ActionBar(props: Props) {
    if (props.portrait) {
        return null;
    }

    if (props.fullscreen && !props.actionBar) {
        return null;
    }

    return html`
    <div class="bg-gray-200 shadow w-10 h-full overflow-hidden flex flex-col items-center">
        <${props.fullscreen ? HideControl : SideBarControl} ...${props} />
        <${Controls} column="true" class="flex-grow border-t-2 border-gray-400" ...${props} />
    </div>
    `;
}

function SideBarControl(props: Props) {
    function toggleSideBar() {
        if (props.sideBar) {
            props.closeSideBar();
        } else {
            props.openSideBar();
        }
    }

    return html`
    <div class="h-6 w-6 my-4 ${props.sideBar ? " text-green-400" : "text-gray-600" } cursor-pointer"
        onClick=${toggleSideBar}>
        <${Icons.DotsHorizontal} class="h-6 w-6" />
    </div>
    `;
}

function HideControl(props: Props) {
    return html`
    <div class="h-6 w-6 my-4 cursor-pointer" onClick=${() => props.setActionBar(false)}>
        <${Icons.ChevronDoubleLeft} class="h-6 w-6" />
    </div>
    `;
}