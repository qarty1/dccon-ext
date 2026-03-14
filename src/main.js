import PreferencesHandler from "./modules/preferences-handler.js";

var keydownListener;
const keydownModal = new bootstrap.Modal('#detectKeydown', {

});

document.getElementById("dcconActive").addEventListener("change", (e) => {
  let node = e.currentTarget;
  PreferencesHandler.setDcconActive(node.checked).then(success => {
    if(success) {
      let active = node.checked;
      if(active) {
        node.parentNode.nextElementSibling.classList.remove("disabled");
        document.getElementsByName('imageAction').forEach(e => {
          e.removeAttribute("disabled");
        });
        
        document.getElementById('chatToDccon').removeAttribute("disabled");
        document.getElementById('showCopyToast').removeAttribute("disabled");
        document.getElementById('dcconWindowWidth').removeAttribute("disabled");
        document.getElementById('dcconNewline').removeAttribute("disabled");
        document.getElementById('showScrollbar').removeAttribute("disabled");
        document.getElementById('iconttvCompatibility').removeAttribute("disabled");
        document.getElementById('useTagConverter').removeAttribute("disabled");
        document.getElementById('typeFixed').removeAttribute("disabled");
        
        /*document.getElementsByName('dcconColumnType').forEach(e => {
          e.removeAttribute("disabled");
        });*/
        document.getElementById('dcconColumnCount').removeAttribute("disabled");
        document.getElementById('actionKey').removeAttribute("disabled");
        document.getElementById('dcconChangeCount').removeAttribute("disabled");

      } else {
        node.parentNode.nextElementSibling.classList.add("disabled");
        document.getElementsByName('imageAction').forEach(e => {
          e.setAttribute("disabled", true);
        });
        document.getElementById('chatToDccon').setAttribute("disabled", true);
        document.getElementById('showCopyToast').setAttribute("disabled", true);
        document.getElementById('dcconWindowWidth').setAttribute("disabled", true);
        document.getElementById('dcconNewline').setAttribute("disabled", true);
        document.getElementById('showScrollbar').setAttribute("disabled", true);
        document.getElementById('iconttvCompatibility').setAttribute("disabled", true);
        document.getElementById('useTagConverter').setAttribute("disabled", true);
        document.getElementById('typeFixed').setAttribute("disabled", true);
        /*document.getElementsByName('dcconColumnType').forEach(e => {
          e.setAttribute("disabled", true);
        });*/
        document.getElementById('dcconColumnCount').setAttribute("disabled", true);
        document.getElementById('actionKey').setAttribute("disabled", true);
        document.getElementById('dcconChangeCount').removeAttribute("disabled", true);
      }
    }
  });
});
document.getElementsByName("imageAction").forEach(element => {
  element.addEventListener("change", async (e) => {
    let success = await PreferencesHandler.setImageAction(e.currentTarget.value);
    console.log(`설정 여부 : ${success}`);
  });
});
/*document.getElementById("imageAction").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setImageAction(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});*/
document.getElementById("chatToDccon").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setChatToDccon(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("showCopyToast").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setShowCopyToast(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("setDcconWindowWidth").addEventListener("click", async (e) => {
  let width = document.getElementById("dcconWindowWidth").value;
  if(isNaN(parseInt(width))) {
    alert("숫자만 입력해주세요.");
    return;
  }
  let success = await PreferencesHandler.setDcconWindowWidth(width);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("initDcconWindowWidth").addEventListener("click", async (e) => {
  let success = await PreferencesHandler.setDcconWindowWidth(null);
  document.getElementById("dcconWindowWidth").value = "";
  console.log(`설정 여부 : ${success}`);
});

document.getElementById("dcconNewline").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setDcconNewline(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("showScrollbar").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setShowScrollbar(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("iconttvCompatibility").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setIconttvCompatible(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("useTagConverter").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setUseTagConverter(e.currentTarget.checked);
  console.log(`설정 여부 : ${success}`);
});
document.getElementById("typeFixed").addEventListener("change", async (e) => {
  let success = await PreferencesHandler.setDcconColumnFixed(e.currentTarget.checked);

 if(e.target.checked) {
    document.getElementsByClassName("dcconCountForm")[0].classList.remove("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[0].removeAttribute("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[1].removeAttribute("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[2].removeAttribute("disabled");
  } else {
    document.getElementsByClassName("dcconCountForm")[0].classList.add("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[0].setAttribute("disabled", true);
    document.getElementsByClassName("dcconCountForm")[0].children[1].setAttribute("disabled", true);
    document.getElementsByClassName("dcconCountForm")[0].children[2].setAttribute("disabled", true);
  }
  console.log(`설정 여부 : ${success}`);
});

/*document.getElementsByName("dcconColumnType").forEach(element => {
  element.addEventListener("change", async (e) => {
    let success = await PreferencesHandler.setDcconColumnType(e.target.value);
    console.log(`설정 여부 : ${success}`);
    if(e.target.value == "1") {
      document.getElementById("dcconCountForm").style.display = "none";
    } else {
      document.getElementById("dcconCountForm").style.display = "flex";
    }
  });
});*/
document.getElementById("setDcconColumnCount").addEventListener("click", async (e) => {
  let count = document.getElementById("dcconColumnCount").value;
  if(isNaN(parseInt(count))) {
    alert("숫자만 입력해주세요.");
    return;
  }
  if(parseInt(count) < 1) {
    alert("1 이상으로 입력해주세요.");
    return;
  }
  
  let success = await PreferencesHandler.setDcconColumnCount(count);
  console.log(`설정 여부 : ${success}`);
});

document.getElementById("initDcconColumnCount").addEventListener("click", async (e) => {
  let success = await PreferencesHandler.setDcconColumnCount(null);
  document.getElementById("dcconColumnCount").value = "3";
  console.log(`설정 여부 : ${success}`);
});

document.getElementById("actionKey").addEventListener("click", (e) => {
  e.preventDefault();
  keydownListener = async function(event) {
    document.getElementById("actionKey").innerText = event.key;
    let success = await PreferencesHandler.setActionKey(event.key);
    console.log(`설정 여부 : ${success}`);
    keydownModal.hide();
  }
  keydownModal.show();
});

document.getElementById("setDcconChangeCount").addEventListener("click", async (e) => {
  let count = document.getElementById("dcconChangeCount").value;
  if(isNaN(parseInt(count))) {
    alert("숫자만 입력해주세요.");
    return;
  }
  if(parseInt(count) < 1) {
    alert("1 이상으로 입력해주세요.");
    return;
  }
  
  let success = await PreferencesHandler.setDcconChangeCount(count);
  console.log(`설정 여부 : ${success}`);
});

document.getElementById("initDcconChangeCount").addEventListener("click", async (e) => {
  let success = await PreferencesHandler.setDcconChangeCount("2");
  document.getElementById("dcconChangeCount").value = "2";
  console.log(`설정 여부 : ${success}`);
});

document.addEventListener('DOMContentLoaded', async function() {
  const dcconActiveCheckbox = document.getElementById('dcconActive');
  const imageActionCheckbox = document.getElementsByName('imageAction');
  const chatToDcconCheckbox = document.getElementById('chatToDccon');
  const showCopyToastCheckbox = document.getElementById('showCopyToast');
  const dcconWindowWidthText = document.getElementById('dcconWindowWidth');
  const dcconNewlineCheckbox = document.getElementById('dcconNewline');
  const showScrollbarCheckbox = document.getElementById('showScrollbar');
  const iconttvCompatibilityCheckbox = document.getElementById('iconttvCompatibility');
  const useTagConverterCheckBox = document.getElementById('useTagConverter');
  const dcconColumnFixedCheckBox = document.getElementById('typeFixed');
  const dcconColumnCountText = document.getElementById('dcconColumnCount');
  const actionKeyButton = document.getElementById('actionKey');
  const dcconChangeCountText = document.getElementById('dcconChangeCount');

  const dcconActiveState = await PreferencesHandler.getDcconActive();
  const imageActionState = await PreferencesHandler.getImageAction();
  const chatToDcconState = await PreferencesHandler.getChatToDccon();
  const showCopyToastState = await PreferencesHandler.getShowCopyToast();
  const dcconWindowWidth = await PreferencesHandler.getDcconWindowWidth();
  const dcconNewLineState = await PreferencesHandler.getDcconNewline();
  const showScrollbarState = await PreferencesHandler.getShowScrollbar();
  const iconttvCompatibilityState = await PreferencesHandler.getIconttvCompatible();
  const useTagConverterState = await PreferencesHandler.getUseTagConverter();
  const dcconColumnFixed = await PreferencesHandler.getDcconColumnFixed();
  const dcconColumnCount = await PreferencesHandler.getDcconColumnCount();
  const actionKey = await PreferencesHandler.getActionKey();
  const dcconChangeCount = await PreferencesHandler.getDcconChangeCount();

  dcconActiveCheckbox.checked = dcconActiveState;
  imageActionCheckbox.forEach(e => {
    if(e.value == imageActionState) {
      e.checked = true;
    } else {
      e.checked = false;
    }
  });
  chatToDcconCheckbox.checked = chatToDcconState;
  showCopyToastCheckbox.checked = showCopyToastState;
  if(dcconWindowWidth != null) {
    dcconWindowWidthText.value = dcconWindowWidth;
  }
  dcconNewlineCheckbox.checked = dcconNewLineState;
  showScrollbarCheckbox.checked = showScrollbarState;
  iconttvCompatibilityCheckbox.checked = iconttvCompatibilityState;
  useTagConverterCheckBox.checked = useTagConverterState;
  dcconColumnFixedCheckBox.checked = dcconColumnFixed;
  dcconChangeCountText.value = dcconChangeCount;
  /*(e => {
    if(e.value == dcconColumnType) {
      e.checked = true;
    } else {
      e.checked = false;
    }
    if(dcconColumnType == "1") {
      document.getElementById("dcconCountForm").style.display = "none";
    } else {
      document.getElementById("dcconCountForm").style.display = "flex";
    }
  });*/
  if(dcconColumnFixed) {
    document.getElementsByClassName("dcconCountForm")[0].classList.remove("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[0].removeAttribute("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[1].removeAttribute("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[2].removeAttribute("disabled");
  } else {
    document.getElementsByClassName("dcconCountForm")[0].classList.add("disabled");
    document.getElementsByClassName("dcconCountForm")[0].children[0].setAttribute("disabled", true);
    document.getElementsByClassName("dcconCountForm")[0].children[1].setAttribute("disabled", true);
    document.getElementsByClassName("dcconCountForm")[0].children[2].setAttribute("disabled", true);
  }
    
  if(dcconColumnCount != null) {
    dcconColumnCountText.value = dcconColumnCount;
  }
  actionKeyButton.innerText = actionKey;

  if(dcconActiveState) {
    document.getElementsByClassName("header-row")[0].nextElementSibling.classList.remove("disabled");
    //document.getElementById('imageAction').removeAttribute("disabled");
    document.getElementsByName('imageAction').forEach(e => {
      e.removeAttribute("disabled");
    });
    document.getElementById('chatToDccon').removeAttribute("disabled");
    document.getElementById('showCopyToast').removeAttribute("disabled");
    document.getElementById('dcconWindowWidth').removeAttribute("disabled");
    document.getElementById('dcconNewline').removeAttribute("disabled");
    document.getElementById('showScrollbar').removeAttribute("disabled");
    document.getElementById('iconttvCompatibility').removeAttribute("disabled");
    document.getElementById('useTagConverter').removeAttribute("disabled");
    document.getElementById('typeFixed').removeAttribute("disabled");
    /*document.getElementsByName('dcconColumnType').forEach(e => {
      e.removeAttribute("disabled");
    });*/
    document.getElementById('dcconColumnCount').removeAttribute("disabled");
    document.getElementById('actionKey').removeAttribute("disabled");
  } else {
    document.getElementsByClassName("header-row")[0].nextElementSibling.classList.add("disabled");
    //document.getElementById('imageAction').setAttribute("disabled", true);
    document.getElementsByName('imageAction').forEach(e => {
      e.setAttribute("disabled", true);
    });
    document.getElementById('chatToDccon').setAttribute("disabled", true);
    document.getElementById('showCopyToast').setAttribute("disabled", true);
    document.getElementById('dcconWindowWidth').setAttribute("disabled", true);
    document.getElementById('dcconNewline').setAttribute("disabled", true);
    document.getElementById('showScrollbar').setAttribute("disabled", true);
    document.getElementById('iconttvCompatibility').setAttribute("disabled", true);
    document.getElementById('useTagConverter').setAttribute("disabled", true);
    document.getElementById('typeFixed').setAttribute("disabled", true);
    /*document.getElementsByName('dcconColumnType').forEach(e => {
      e.setAttribute("disabled", true);
    });*/
    document.getElementById('dcconColumnCount').setAttribute("disabled", true);
    document.getElementById('actionKey').setAttribute("disabled", true);
  }
});


const keydownEventModal = document.getElementById('detectKeydown')
keydownEventModal.addEventListener('hide.bs.modal', event => {
  document.removeEventListener("keydown", keydownListener);
});
keydownEventModal.addEventListener('shown.bs.modal', event => {
  document.addEventListener("keydown", keydownListener);
});

/*
function test() {

        var fileText = "Your content which you want to save in file";   //파일에 저장될 본문
 
        var fileBlob = new Blob([fileText], {   //가상의 파일시스템
            type: 'text/plain'
        });
        var fileUrl = URL.createObjectURL(fileBlob);    //다운로드 가능한 url 생성
        var fileName = 'mytextfile.txt';    //저장될 파일명, 경로. 크롬에 설정된 다운로드 경로에 저장
 
        var fileOptions = {
            filename: fileName,
            url: fileUrl,
            saveAs: false
        };
        //fileOptions.saveAs = true;    //저장 시 다운로드 창(어디에 다운할지 정하는 대화창) 띄우기
        //console.log(browser.downloads);
        browser.downloads.download(fileOptions);
    // 필요 시 URL 해제// 10초 후 해제
	; //크롬 다운로드 api
}*/