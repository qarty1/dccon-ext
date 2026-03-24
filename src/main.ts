import PreferencesHandler from "./contentScript/config/preferences-handler";

declare const bootstrap: any;

class SettingsManager {
  private keydownListener?: (event: KeyboardEvent) => Promise<void>;
  private keydownModal: any;

  private readonly dependentSettingIds = [
    'chatToDccon', 'showCopyToast', 'dcconWindowWidth', 'dcconNewline',
    'showScrollbar', 'iconttvCompatibility', 'useTagConverter', 'typeFixed',
    'dcconColumnCount', 'actionKey', 'dcconChangeCount', 'useDcconWindowTyping'
  ];

  constructor() {
    const modalEl = document.getElementById('detectKeydown');
    if (modalEl) {
      this.keydownModal = new bootstrap.Modal(modalEl, {});
      modalEl.addEventListener('hide.bs.modal', () => {
        if (this.keydownListener) document.removeEventListener("keydown", this.keydownListener);
      });
      modalEl.addEventListener('shown.bs.modal', () => {
        if (this.keydownListener) document.addEventListener("keydown", this.keydownListener);
      });
    }
  }

  public async init() {
    await this.loadInitialState();
    this.bindEvents();
  }

  private getEl<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  private async loadInitialState() {
    const setCheck = (id: string, state: boolean) => {
      const el = this.getEl<HTMLInputElement>(id);
      if (el) el.checked = state;
    };

    const setVal = (id: string, state: any) => {
      const el = this.getEl<HTMLInputElement>(id);
      if (el && state !== null) el.value = state.toString();
    };

    setCheck('dcconActive', await PreferencesHandler.getDcconActive());
    setCheck('chatToDccon', await PreferencesHandler.getChatToDccon());
    setCheck('showCopyToast', await PreferencesHandler.getShowCopyToast());
    setCheck('dcconNewline', await PreferencesHandler.getDcconNewline());
    setCheck('showScrollbar', await PreferencesHandler.getShowScrollbar());
    setCheck('iconttvCompatibility', await PreferencesHandler.getIconttvCompatible());
    setCheck('useTagConverter', await PreferencesHandler.getUseTagConverter());
    setCheck('typeFixed', await PreferencesHandler.getDcconColumnFixed());
    setCheck('useDcconWindowTyping', await PreferencesHandler.getUseDcconWindowTyping());

    setVal('dcconWindowWidth', await PreferencesHandler.getDcconWindowWidth());
    setVal('dcconColumnCount', await PreferencesHandler.getDcconColumnCount());
    setVal('dcconChangeCount', await PreferencesHandler.getDcconChangeCount());

    const imageActionState = await PreferencesHandler.getImageAction();
    document.getElementsByName('imageAction').forEach(e => {
      (e as HTMLInputElement).checked = (parseInt((e as HTMLInputElement).value, 10) === imageActionState);
    });

    const actionKeyButton = this.getEl<HTMLElement>('actionKey');
    if (actionKeyButton) actionKeyButton.innerText = await PreferencesHandler.getActionKey();

    // 초기 상태 로드 후 렌더링 동기화를 위해 change 이벤트를 강제로 발생
    this.getEl('typeFixed')?.dispatchEvent(new Event('change'));
    this.getEl('dcconActive')?.dispatchEvent(new Event('change'));
  }

  private bindEvents() {
    this.getEl('dcconActive')?.addEventListener("change", (e: Event) => {
      const node = e.currentTarget as HTMLInputElement;
      PreferencesHandler.setDcconActive(node.checked).then(success => {
        if (success) this.toggleDependentSettings(node.checked, node);
      });
    });

    document.getElementsByName("imageAction").forEach(element => {
      element.addEventListener("change", async (e: Event) => {
        const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
        const success = await PreferencesHandler.setImageAction(val);
        // console.log(`설정 여부 : ${success}`);
      });
    });

    this.bindCheckbox('chatToDccon', PreferencesHandler.setChatToDccon.bind(PreferencesHandler));
    this.bindCheckbox('showCopyToast', PreferencesHandler.setShowCopyToast.bind(PreferencesHandler));
    this.bindCheckbox('dcconNewline', PreferencesHandler.setDcconNewline.bind(PreferencesHandler));
    this.bindCheckbox('showScrollbar', PreferencesHandler.setShowScrollbar.bind(PreferencesHandler));
    this.bindCheckbox('iconttvCompatibility', PreferencesHandler.setIconttvCompatible.bind(PreferencesHandler));
    this.bindCheckbox('useTagConverter', PreferencesHandler.setUseTagConverter.bind(PreferencesHandler));
    this.bindCheckbox('useDcconWindowTyping', PreferencesHandler.setUseDcconWindowTyping.bind(PreferencesHandler));

    this.getEl('typeFixed')?.addEventListener("change", async (e: Event) => {
      const isChecked = (e.currentTarget as HTMLInputElement).checked;
      const success = await PreferencesHandler.setDcconColumnFixed(isChecked);
      
      const countForm = document.getElementsByClassName("dcconCountForm")[0];
      if (countForm) {
        if (isChecked) {
          countForm.classList.remove("disabled");
          Array.from(countForm.children).forEach(child => child.removeAttribute("disabled"));
        } else {
          countForm.classList.add("disabled");
          Array.from(countForm.children).forEach(child => child.setAttribute("disabled", "true"));
        }
      }
      // console.log(`설정 여부 : ${success}`);
    });

    this.bindNumberInput('setDcconWindowWidth', 'dcconWindowWidth', PreferencesHandler.setDcconWindowWidth.bind(PreferencesHandler), { min: null });
    this.bindInitButton('initDcconWindowWidth', 'dcconWindowWidth', "", () => PreferencesHandler.setDcconWindowWidth(null));

    this.bindNumberInput('setDcconColumnCount', 'dcconColumnCount', PreferencesHandler.setDcconColumnCount.bind(PreferencesHandler), { min: 1 });
    this.bindInitButton('initDcconColumnCount', 'dcconColumnCount', "3", () => PreferencesHandler.setDcconColumnCount(null));

    this.bindNumberInput('setDcconChangeCount', 'dcconChangeCount', PreferencesHandler.setDcconChangeCount.bind(PreferencesHandler), { min: 1 });
    this.bindInitButton('initDcconChangeCount', 'dcconChangeCount', "2", () => PreferencesHandler.setDcconChangeCount(2));

    this.getEl('actionKey')?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.keydownListener = async (event: KeyboardEvent) => {
        const actionKeyEl = this.getEl('actionKey');
        if (actionKeyEl) actionKeyEl.innerText = event.key;
        const success = await PreferencesHandler.setActionKey(event.key);
        // console.log(`설정 여부 : ${success}`);
        this.keydownModal?.hide();
      };
      this.keydownModal?.show();
    });
  }

  private toggleDependentSettings(isActive: boolean, node: HTMLInputElement) {
    if (isActive) {
      node.parentElement?.nextElementSibling?.classList.remove("disabled");
      document.getElementsByName('imageAction').forEach(el => (el as HTMLInputElement).removeAttribute("disabled"));
      this.dependentSettingIds.forEach(id => this.getEl(id)?.removeAttribute("disabled"));
    } else {
      node.parentElement?.nextElementSibling?.classList.add("disabled");
      document.getElementsByName('imageAction').forEach(el => (el as HTMLInputElement).setAttribute("disabled", "true"));
      this.dependentSettingIds.forEach(id => this.getEl(id)?.setAttribute("disabled", "true"));
    }
  }

  private bindCheckbox(id: string, setter: (val: boolean) => Promise<boolean>) {
    this.getEl(id)?.addEventListener("change", async (e: Event) => {
      const success = await setter((e.currentTarget as HTMLInputElement).checked);
      // console.log(`설정 여부 : ${success}`);
    });
  }

  private bindNumberInput(btnId: string, inputId: string, setter: (val: number) => Promise<boolean>, opts?: { min?: number | null }) {
    this.getEl(btnId)?.addEventListener("click", async () => {
      const text = this.getEl<HTMLInputElement>(inputId)?.value || "";
      const val = parseInt(text, 10);
      if (isNaN(val)) {
        alert("숫자만 입력해주세요.");
        return;
      }
      if (opts?.min !== undefined && opts?.min !== null && val < opts.min) {
        alert(`${opts.min} 이상으로 입력해주세요.`);
        return;
      }
      const success = await setter(val);
      // console.log(`설정 여부 : ${success}`);
    });
  }

  private bindInitButton(btnId: string, inputId: string, defaultVal: string, resetter: () => Promise<boolean>) {
    this.getEl(btnId)?.addEventListener("click", async () => {
      const success = await resetter();
      const el = this.getEl<HTMLInputElement>(inputId);
      if (el) el.value = defaultVal;
      // console.log(`설정 여부 : ${success}`);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SettingsManager().init();
});
