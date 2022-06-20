import { useAppDispatch, useAppSelector } from './reduxTK';

export const useModalPortal = (id: string) => {
	const [loaded, setLoaded] = useState(false);
	const { user } = useAppSelector(selectUser);

	useEffect(() => {
		const div = document.createElement('div');
		div.setAttribute('id', id);
		const modalParent = document.getElementById('modals');
		modalParent?.append(div);
		setLoaded(true);

		return () => {
			modalParent?.removeChild(div);
		};
	}, [id]);

	return { loaded, id, user };
};

export const useToastLogic = (
	id: string,
	setToasts: React.Dispatch<React.SetStateAction<IToast[]>>,
	toasts: IToast[],
	autoClose: boolean,
	autoCloseTime: number,
	pauseOnHover: boolean,
	pauseOnOutFocus: boolean
) => {
	const progressBarRef = useRef<HTMLDivElement>(null);
	const toastRef = useRef<HTMLDivElement>(null);

	const removeToast = useCallback(
		(id: string) => {
			setToasts(toasts.filter((item) => item.id !== id));
		},
		[setToasts, toasts]
	);

	const timeVisible = useRef(0);
	const isPause = useRef(false);
	const shouldUnPause = useRef(false);

	const setOnPause = useCallback(() => {
		isPause.current = true;
	}, []);
	const setUnPause = useCallback(() => {
		isPause.current = false;
	}, []);
	const changeVisibility = useCallback(() => {
		shouldUnPause.current = document.visibilityState === 'visible';
	}, []);

	useEffect(() => {
		let autoCloseInterval: number;
		if (autoClose === false) return;
		let lastTime: number | null;
		const func = (time: number) => {
			if (shouldUnPause.current) {
				lastTime = null;
				shouldUnPause.current = false;
			}
			if (lastTime == null) {
				lastTime = time;
				autoCloseInterval = requestAnimationFrame(func);
				return;
			}
			if (!isPause.current) {
				timeVisible.current = timeVisible.current + (time - lastTime);
				progressBarRef.current?.style.setProperty('--progress', `${timeVisible.current / autoCloseTime}`);
				if (timeVisible.current >= autoCloseTime) {
					setToasts(toasts.filter((item) => item.id !== id));
					return;
				}
			}
			lastTime = time;
			autoCloseInterval = requestAnimationFrame(func);
		};

		autoCloseInterval = requestAnimationFrame(func);

		return () => cancelAnimationFrame(autoCloseInterval);
	}, [autoClose, autoCloseTime, id, setToasts, toasts]);

	useEffect(() => {
		if (!toastRef.current || !pauseOnHover) return;
		const toast = toastRef.current;

		toast.addEventListener('mouseenter', setOnPause);
		toast.addEventListener('mouseleave', setUnPause);

		return () => {
			toast.removeEventListener('mouseenter', setOnPause);
			toast.removeEventListener('mouseleave', setUnPause);
		};
	}, [pauseOnHover, setOnPause, setUnPause]);

	useEffect(() => {
		if (!toastRef.current || !pauseOnOutFocus) return;

		document.addEventListener('visibilitychange', changeVisibility);

		return () => {
			document.removeEventListener('visibilitychange', changeVisibility);
		};
	}, [setOnPause, setUnPause, pauseOnOutFocus, changeVisibility]);

	return { progressBarRef, toastRef, removeToast };
};
