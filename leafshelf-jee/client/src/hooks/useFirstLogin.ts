export function useFirstLogin() {
  const isFirstTime = !localStorage.getItem('leafshelf_welcome_seen');
  const markAsSeen = () => localStorage.setItem('leafshelf_welcome_seen', 'true');
  return { isFirstTime, markAsSeen };
}
