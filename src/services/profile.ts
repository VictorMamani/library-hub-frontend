import { request } from './api';

export interface ProfilePhoto {
  photo: string | null;
}

export function saveProfilePhoto(photo: string) {
  return request<ProfilePhoto>(
    '/profile/photo',
    { method: 'POST', body: JSON.stringify({ photo }) },
    true,
  );
}

export function removeProfilePhoto() {
  return request<ProfilePhoto>('/profile/photo/remove', { method: 'POST' }, true);
}
