import os
import glob

root_dir = "/Users/nile/Desktop/celsor/celsior-new-website"

# Current overlays (from last run)
old_gl = 'background: linear-gradient(to right, rgba(11, 11, 11, 0.75) 0%, rgba(11, 11, 11, 0.35) 30%, transparent 55%);'
old_gb = 'background: linear-gradient(to top, #0b0b0b 20%, rgba(11, 11, 11, 0.5) 50%, transparent);'
old_gt = 'background: linear-gradient(to bottom, rgba(11, 11, 11, 0.7), transparent);'

# Even lighter overlays
new_gl = 'background: linear-gradient(to right, rgba(11, 11, 11, 0.55) 0%, rgba(11, 11, 11, 0.2) 25%, transparent 50%);'
new_gb = 'background: linear-gradient(to top, rgba(11, 11, 11, 0.85) 10%, rgba(11, 11, 11, 0.35) 40%, transparent);'
new_gt = 'background: linear-gradient(to bottom, rgba(11, 11, 11, 0.45), transparent);'

# Find all HTML files (skip audits directory)
html_files = glob.glob(os.path.join(root_dir, "**/*.html"), recursive=True)
html_files += glob.glob(os.path.join(root_dir, "*.html"))

# Deduplicate
html_files = list(set(html_files))

count = 0
for f_path in html_files:
    if "/audits/" in f_path:
        continue
    with open(f_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content = content
    new_content = new_content.replace(old_gl, new_gl)
    new_content = new_content.replace(old_gb, new_gb)
    new_content = new_content.replace(old_gt, new_gt)
    
    if new_content != content:
        with open(f_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        count += 1
        print(f"UPDATED: {os.path.relpath(f_path, root_dir)}")

print(f"\nTotal files updated: {count}")
