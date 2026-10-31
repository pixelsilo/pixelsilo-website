// The story: one website build for a client called Renaissance, told in frames at 60fps.
export const FPS = 60;

export const STAGES = ['Discovery call', 'Scope & wireframes', 'Design concepts', 'Motion & CGI', 'High-fidelity design', 'Build', 'Testing & QA', 'Launch & handover'];
export const SIGNOFFS = [['Signed off', 'Eleanor Marsh'], ['Approved', 'Daniel Okafor'], ['Approved', 'Eleanor Marsh']];

export const HOOK = ['Built', 'for', 'efficiency', 'and', 'oversight.'];
export const ANSWER = ['One', 'place.', 'Everyone', 'across', 'it.'];
export const SUMMARY = 'Everything for the design stage is in and received, including Priya’s feedback on the homepage concept. Build starts Monday.'.split(' ');

export const PLATFORMS = [
  { icon: 'mail', platform: 'Email', name: 'Eleanor Marsh', initials: 'EM', text: 'Replies to the to-do email' },
  { icon: 'spark', platform: 'AI assistant', name: 'Daniel Okafor', initials: 'DO', text: '“Send Luke the partner biographies.”' },
  { icon: 'screen', platform: 'Dashboard', name: 'Priya Raman', initials: 'PR', text: 'Pastes links and notes in the app' },
  { icon: 'phone', platform: 'Mobile', name: 'Marcus Hale', initials: 'MH', text: 'Uploads from his phone' },
];

// kind, title, platform index, frame sent, frame Luke marks it done, the reply and its chips.
export const ITEMS = [
  { kind: 'image', label: 'Images', title: 'Team portraits', from: 0, sent: 340, received: 374, reply: 'Portraits attached, more next week.', chips: ['IMG_2041.jpg', 'IMG_2046.jpg', 'IMG_2052.jpg'] },
  { kind: 'copy', label: 'Copy', title: 'Partner biographies', from: 1, sent: 392, received: 426, reply: 'Six biographies, around 120 words each.', chips: ['partner-biographies.docx'] },
  { kind: 'link', label: 'Link', title: 'Brand guidelines (Figma)', from: 2, sent: 444, received: 478, reply: 'Latest version, view access for the studio.', chips: ['figma.com/file/renaissance-brand'] },
  { kind: 'video', label: 'Video', title: 'Founder interview', from: 3, sent: 496, received: 530, reply: 'Full interview, cut to follow.', chips: ['founder-interview.mp4 · 2:40'] },
  { kind: 'access', label: 'Access', title: 'Domain registrar login', from: 0, sent: 548, received: 582, reply: 'Shared securely. Let us know when you’re in.', chips: ['1 login'] },
  { kind: 'feedback', label: 'Feedback', title: 'Homepage concept', from: 2, sent: 606, received: 652, reply: 'We love the stone direction. Could the headline sit a little lower?', chips: [] },
];
