export const GlobalUtils = {
    
    isChzzk: () => {
        const url = window.location.hostname;
        return url.includes('chzzk');
    },
    isCime:() => {
        const url = window.location.hostname;
        return url.includes('ci.me');
    },
    showToast: (text: string, targetElement: HTMLElement | null) => {
        if (!targetElement) return;
        
        const toast = document.createElement("div");
        toast.classList.add("copyToast");
        toast.innerText = `"${text}" 복사 완료!`;
        
        targetElement.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('dccon-fade-out');
        }, 400);
        
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }
} as const;