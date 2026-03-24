import { DOMSelectors } from "../domSelector/domSelectors";
import { GlobalUtils } from "../utils/global-utils";

export class DcconButton {
    private dcconBtn: HTMLElement;

    constructor(private domSelectors: DOMSelectors, private onClick: () => void) {
        const isChzzk = GlobalUtils.isChzzk();
        const isCime = GlobalUtils.isCime();
        
        let btnSize = 30;
        let viewBoxSize = 30;
        if(isCime) {
            btnSize = 26;
            viewBoxSize = 28;
        }
        const dcconBtnStringTemplate = 
            `<svg
            version="1.1"
            id="dcconBtnSvg"
            width="${btnSize}"
            height="${btnSize}"
            viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"
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
            </g></svg>`;
        
        this.dcconBtn = document.createElement("button");
        this.dcconBtn.id = "dcconBtn";
        this.dcconBtn.innerHTML = dcconBtnStringTemplate;

        if(isCime) {
            this.dcconBtn.classList.add("cm");
        }

        // 버튼 클릭 시 디시콘 윈도우 토글
        this.dcconBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.onClick(); // AppListener 등에서 전달받은 콜백 실행
        });
    }

    public mount() {
        const dcconBtnAppenderSelector = this.domSelectors.dcconButtonAppender;
        
        const dcconBtnAppender = document.querySelector(dcconBtnAppenderSelector);
        //const inputContainerSelector = dcconBtnAppender?.parentNode;
        const inputContainer = dcconBtnAppender?.parentNode;

        if (inputContainer && !inputContainer.contains(this.dcconBtn)) {
            inputContainer.insertBefore(this.dcconBtn, dcconBtnAppender.nextSibling);
        }
    }

    public unmount() {
        if (this.dcconBtn.parentNode) {
            this.dcconBtn.remove();
        }
    }

    public setActive(isActive: boolean) {
        if (isActive) {
            this.dcconBtn.classList.add("on");
        } else {
            this.dcconBtn.classList.remove("on");
        }
    }
}