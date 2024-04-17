import type { LoginStrategyInterface } from '../interfaces/LoginStrategyInterface';
import { privkeyLogin } from '../utils/helper';
import { ndkUser } from '../stores/stores';
import { UserProfileService } from './userProfileService';
import { nip19 } from 'nostr-tools';

export class PrivateKeyLoginService implements LoginStrategyInterface {
	userProfileService: UserProfileService = new UserProfileService();
	async login(privateKey: string): Promise<'success' | 'error'> {
		try {
			if (!privateKey.startsWith('nsec')) {
				alert('Please use your nsec to login');
				return 'error';
			}
			const user = await privkeyLogin(nip19.decode(privateKey).data as string);
			if (user) {
				ndkUser.set(user);
				this.userProfileService.fetchUserProfile(user.pubkey);
				return 'success';
			} else {
				console.error('PrivateKey login failed.');
				return 'error';
			}
		} catch (error) {
			console.log('Error with Private key login ' + error);
			return 'error';
		}
	}
}
