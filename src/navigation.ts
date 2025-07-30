import { getPermalink } from './utils/permalinks';

const menuLinks = (content) => {
  return content.menu.map(({ label, link }) => ({
    text: label,
    href: link,
  }));
};
export const headerData = (content) => {
  return {
    links: menuLinks(content),
    socialLinks: [
      { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
      { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-linkedin', href: '#' },
    ],
  };
};

export const footerData = (content) => {
  return {
    links: [
      {
        links: menuLinks(content),
      },
    ],
    secondaryLinks: [
      { text: content.footer.terms, href: getPermalink('/terms') },
      { text: content.footer.privacy, href: getPermalink('/privacy') },
    ],
    socialLinks: [
      { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
      { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook-filled', href: '#' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-linkedin-filled', href: '#' },
    ],

    footNote: content.footer.rights,
    address: content.footer.address,
  };
};
