import { chzzkDOM } from "../modules/cime-dom-controller";

export class DcconBtnObserver {
    constructor(dcconState) {
        const $dcconBtn = $("<button>").attr("id", "dcconBtn").addClass(chzzkDOM.chatActionButton).html(
        `<svg
            version="1.1"
            id="dcconBtnSvg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:svg="http://www.w3.org/2000/svg">
            <defs
                id="defs1" />
            <g
                id="g4"
                transform="matrix(0.1631033,0,0,0.1631033,-0.0015398,0.02773044)">
                <g
                    id="g5"
                    transform="translate(0.6931267,-0.18337818)">
                <path
                    style="fill:none;stroke:#c9cedc;stroke-width:10;stroke-dasharray:none;stroke-opacity:1"
                    d="m 54.987189,33.550942 h 72.398451 l 18.09978,31.30953 -41.09299,-4.9e-5 -25.94572,30.52854 H 57.628707 L 50.326332,83.659385 H 26.633505 Z"
                    id="path3"/>
                <path
                    style="fill:none;stroke:#c9cedc;stroke-width:10;stroke-dasharray:none;stroke-opacity:1"
                    d="M 57.628707,95.388561 H 78.44671 l 25.94572,-30.528089 h 41.09299 l 15.14171,27.097153 -34.33489,58.083905 H 55.913477 l -33.974283,-58.083905 4.694311,-8.29824 h 23.693077 z"
                    id="path3-7"/>
                </g>
            </g>
        </svg>`);
        
        $dcconBtn.click(() => {
            dcconState.setState(!dcconState.getState());
        });
        this.$btn = $dcconBtn;
    }

    updateScribe(scribe) {
        if(scribe) {
            $(`.${chzzkDOM.chatActionArea}`).find(`.${chzzkDOM.inputContainer}`).append(this.$btn);
        } else {
            $(`.${chzzkDOM.chatActionArea}`).find(`.${chzzkDOM.inputContainer}`).remove(this.$btn);
        }
    }

    update(state) {
        if(state) {
			this.$btn.addClass("on");
		} else {
			this.$btn.removeClass("on");
		}
    }
}