from pathlib import Path

path = Path(r'client/app/dashboard/student/profile/page.tsx')
text = path.read_text(encoding='utf-8')
replacements = [
    ('bg-[#ee8c2b] hover:bg-[#d57a22]', 'bg-[#7C3AED] hover:bg-[#6D28D9]'),
    ('shadow-[#ee8c2b]/20', 'shadow-[#7C3AED]/20'),
    ('focus:ring-[#ee8c2b]', 'focus:ring-[#7C3AED]'),
    ('hover:text-[#ee8c2b]', 'hover:text-[#6D28D9]'),
    ('hover:border-[#ee8c2b]', 'hover:border-[#7C3AED]'),
    ('border-[#ee8c2b]', 'border-[#7C3AED]'),
    ('text-[#ee8c2b]', 'text-[#7C3AED]'),
    ('bg-[#ee8c2b]', 'bg-[#7C3AED]'),
    ('bg-gradient-to-br from-[#1b140d] to-[#3d2e1f]', 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]'),
    ('dark:bg-[#221910]', 'dark:bg-[#0B1739]'),
    ('bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
    ('bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
    ('bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
    ('bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
    ('bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
    ('bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600', 'bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600'),
]

for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
        print(f'Replaced: {old}')
    else:
        print(f'Skipped: {old}')

path.write_text(text, encoding='utf-8')
print('Done patching profile page.')
