export const snackbar = $state({ message: '', error: false });

let timer: ReturnType<typeof setTimeout>;

export function notify(message: string, error = false) {
	Object.assign(snackbar, { message, error });
	clearTimeout(timer);
	timer = setTimeout(() => (snackbar.message = ''), error ? 6000 : 3000);
}
