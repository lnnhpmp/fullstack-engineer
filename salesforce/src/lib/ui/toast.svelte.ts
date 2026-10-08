export const toast = $state({ message: '', variant: 'success' as 'success' | 'error' | 'info' });

let timer: ReturnType<typeof setTimeout>;

export function showToast(message: string, variant: 'success' | 'error' | 'info' = 'success') {
	Object.assign(toast, { message, variant });
	clearTimeout(timer);
	timer = setTimeout(() => (toast.message = ''), variant === 'error' ? 8000 : 4000);
}
