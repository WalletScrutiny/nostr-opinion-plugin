import { get, writable, type Writable } from 'svelte/store';

const stores: Record<string, Writable<unknown>> = {};

type Serializer = {
	parse: (text: string) => unknown;
	stringify: (value: unknown) => string;
};

type LocalStorageStoreOptions = {
	serializer?: Serializer;
	storage?: 'local' | 'session';
};

function getStorage(type: 'local' | 'session'): Storage {
	return type === 'local' ? localStorage : sessionStorage;
}

export function localStorageStore<T>(
	key: string,
	initialValue: T,
	options?: LocalStorageStoreOptions
): Writable<T> {
	const serializer = options?.serializer ?? JSON;
	const storageType = options?.storage ?? 'local';

	function updateStorage(storageKey: string, value: T) {
		if (typeof window === 'undefined') return;
		getStorage(storageType).setItem(storageKey, serializer.stringify(value));
	}

	if (!stores[key]) {
		const store = writable<T>(initialValue, (set) => {
			if (typeof window === 'undefined') return;

			const json = getStorage(storageType).getItem(key);
			if (json) {
				set(serializer.parse(json) as T);
			}

			const handleStorage = (event: StorageEvent) => {
				if (event.key === key) {
					set(event.newValue ? (serializer.parse(event.newValue) as T) : (null as T));
				}
			};
			window.addEventListener('storage', handleStorage);
			return () => window.removeEventListener('storage', handleStorage);
		});

		const { subscribe, set } = store;
		stores[key] = {
			set(value: T) {
				updateStorage(key, value);
				set(value);
			},
			update(updater: (value: T) => T) {
				const value = updater(get(store));
				updateStorage(key, value);
				set(value);
			},
			subscribe
		} as Writable<T>;
	}

	return stores[key] as Writable<T>;
}
