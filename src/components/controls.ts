
import { useState } from "preact/hooks";
import { html } from "../dom";
import { Icons } from "../icons";
import { Props } from "../player-app";

interface ControlsProps extends Props {
    class?: string,
    column?: boolean,
    portal: boolean,
};

const maxScale = 1.5;
const scaleStep = 0.1;

const maxSensitivy = 2;
const minSensitivy = 0.1;

export function Controls(props: ControlsProps) {
    function toggleKeyboard() {
        props.toggleKeyboard();
        props.closeSideBar();
    };

    function toggleFullscreen() {
        props.toggleFullscreen();
        props.closeSideBar();
    };

    function togglePause() {
        props.setPause(!props.pause);
        props.closeSideBar();
    }

    function toggleMute() {
        props.setMute(!props.mute);
        props.closeSideBar();
    }

    return html`
    <div class="flex ${props.column ? " flex-col" : "flex-row"} justify-evenly ${props.class}">
        <${MouseControls} ...${props} />
        <${VirtualControls} ...${props} />
        <div class="h-6 w-6 ${props.pause ? " text-red-400 animate-pulse" : "font-bold"} cursor-pointer"
            onClick=${togglePause}>
            <${props.pause ? Icons.Play : Icons.Pause} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.mute ? " text-green-400" : ""} cursor-pointer" onClick=${toggleMute}>
            <${props.mute ? Icons.VolumeOff : Icons.VolumeUp} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.keyboard ? " text-green-400" : ""} cursor-pointer" onClick=${toggleKeyboard}>
            <${Icons.PencilAlt} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.fullscreen ? " text-green-400" : "" } 
        ${props.options().noFullscreen===true ? "hidden": "" } cursor-pointer" onClick=${toggleFullscreen}>
            <${Icons.ArrowsExpand} class="h-6 w-6" />
        </div>
    </div>
    `;
}

function MouseControls(props: ControlsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [showSync, setShowSync] = useState<boolean>(false);
    const [sensitivity, setSensitivity] = useState<number>(props.player().sensitivity);

    async function menuClick(e: Event) {
        if (!props.portal) {
            await toggleMouseLock(e);
        } else {
            setOpen(!open);
        }
    }

    async function toggleMouseLock(e: Event) {
        await setMouseLock(e, !props.autolock);
    }

    async function setMouseLock(e: Event, newLock: boolean) {
        e.stopPropagation();

        await props.setAutolock(newLock);
        if (open) {
            setOpen(false);
        }
    }

    async function cycleSensivity(e: Event) {
        let newSensitivity = (sensitivity + scaleStep);
        if (sensitivity > maxSensitivy) {
            newSensitivity = minSensitivy;
        }

        await props.player().setSensitivity(newSensitivity);
        setSensitivity(newSensitivity);
        e.stopPropagation();
    }

    function sync(e: Event) {
        props.player().ciPromise?.then((ci) => {
            ci.sendMouseSync();
        });
        if (!showSync) {
            setShowSync(true);
        }
        if (open) {
            setOpen(false);
        }
        e.stopPropagation();
    }

    let scaleText = Math.round(sensitivity * 10) / 10 + "";
    if (scaleText.length === 1) {
        scaleText += ".0";
    }

    const syncVisible = props.portal && !props.autolock && (open || showSync);

    return html`
    <div class="h-6 w-6 text-green-400 cursor-pointer" onClick=${menuClick}>
            <${props.autolock ? Icons.CursorClick : Icons.Cursor} class="h-6 w-6" />
            <div class="${props.portal ? "" : "hidden"} absolute z-50 
                        bg-gray-200 -mt-7 h-8 left-10 flex flex-row items-center
                         rounded-r-md cursor-pointer" onClick=${()=> {}}>
                <div class="flex flex-row ${open ? "" : "hidden"}">
                    <div class="h-6 w-6 mx-2 
                        ${!props.autolock ? "text-green-400" : "text-black"}"
                        onClick=${(e: Event) => setMouseLock(e, false)}>
                        <${Icons.Cursor} class="h-6 w-6" />
                    </div>
                    <div class="h-6 w-6 mx-2 
                        ${props.autolock ? "text-green-400" : "text-black"}"
                        onClick=${(e: Event) => setMouseLock(e, true)}>
                        <${Icons.CursorClick} class="h-6 w-6" />
                    </div>
                    <div class="h-6 mx-2 pl-2 border-l-2 border-gray-400 text-gray-400 ${props.autolock ? "" : "hidden"}
                        ${scaleText === "1.0" ? "text-black" : "text-green-400" }"
                        onClick=${cycleSensivity}>
                        ${scaleText}
                    </div>
                </div>

                <div class="h-6 w-10 pr-2 pl-2 border-l-2 border-gray-400 ${syncVisible ? "" : "hidden"}"
                    onClick=${sync}>
                    <${Icons.Refresh} class="h-6 w-6" />
                </div>
            </div>
        </div>
    `;
}

function VirtualControls(props: ControlsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(props.player().scaleControls);

    function toggleVirtualControlsOpen() {
        if (props.portal) {
            setOpen(!open);
        } else {
            props.setMobileControls(!props.mobileControls);
        }
    }

    async function eyeOff(e: Event) {
        await props.setMirroredControls(false);
        await props.setMobileControls(false);
        setOpen(false);
        e.stopPropagation();
    }

    async function mobile(e: Event) {
        await props.setMobileControls(true);
        await props.setMirroredControls(false);
        setOpen(false);
        e.stopPropagation();
    }

    async function mirrored(e: Event) {
        await props.setMirroredControls(true);
        setOpen(false);
        e.stopPropagation();
    }

    async function cycleScale(e: Event) {
        let newScale = (scale + scaleStep);
        if (scale > maxScale) {
            newScale = 1;
        }

        await props.player().setScaleControls(newScale);
        setScale(newScale);
        e.stopPropagation();
    }

    let scaleText = Math.round(scale * 10) / 10 + "";
    if (scaleText.length === 1) {
        scaleText += ".0";
    }

    return html`
    <div class="h-6 w-6 text-green-400 cursor-pointer" onClick=${toggleVirtualControlsOpen}>
            <${props.mirroredControls ? Icons.SwithcHorizontal :
        (props.mobileControls ? Icons.Mobile : Icons.EyeOff)} class="h-6 w-6" />
            <div class="${open ? "" : "hidden"} absolute z-50 bg-gray-200 -mt-7 h-8 left-10 flex flex-row items-center
                             rounded-r-md cursor-pointer" onClick=${()=> {}}>
                <div class="h-6 w-6 mx-2 
                    ${!props.mobileControls && !props.mirroredControls ? "text-green-400" : "text-black"}"
                    onClick=${eyeOff}>
                    <${Icons.EyeOff} class="h-6 w-6" />
                </div>
                <div class="h-6 w-6 mx-2 
                    ${!props.mirroredControls && props.mobileControls ? "text-green-400" : "text-black"}"
                    onClick=${mobile}>
                    <${Icons.Mobile} class="h-6 w-6" />
                </div>
                <div class="h-6 w-6 mx-2  ${props.mirroredControls ? "text-green-400" : "text-black"}"
                    onClick=${mirrored}>
                    <${Icons.SwithcHorizontal} class="h-6 w-6" />
                </div>
                <div class="h-6 px-2 border-l-2 border-gray-400 
                    ${scaleText === "1.0" ? "text-black" : "text-green-400" }"
                    onClick=${cycleScale}>
                    ${scaleText}
                </div>
            </div>
        </div>
    `;
}
