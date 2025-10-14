#!/usr/bin/env python3
"""
Verification script for Instagram School-Based Follower Bot
Checks that all required files are present and valid.
"""

import os
import json
import sys

def check_file(filename, file_type="file"):
    """Check if a file exists"""
    if os.path.exists(filename):
        size = os.path.getsize(filename)
        print(f"✓ {filename} ({size} bytes)")
        return True
    else:
        print(f"✗ {filename} - MISSING!")
        return False

def verify_json(filename):
    """Verify JSON file is valid"""
    if not os.path.exists(filename):
        print(f"✗ {filename} - MISSING!")
        return False
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        size = os.path.getsize(filename)
        print(f"✓ {filename} ({size} bytes) - Valid JSON")
        return True
    except json.JSONDecodeError as e:
        print(f"✗ {filename} - INVALID JSON: {e}")
        return False
    except Exception as e:
        print(f"✗ {filename} - ERROR: {e}")
        return False

def verify_manifest():
    """Verify manifest.json has required fields"""
    if not os.path.exists('manifest.json'):
        return False
    
    try:
        with open('manifest.json', 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        required_fields = [
            'manifest_version',
            'name',
            'version',
            'permissions',
            'content_scripts',
            'background',
            'action'
        ]
        
        missing = []
        for field in required_fields:
            if field not in manifest:
                missing.append(field)
        
        if missing:
            print(f"  ⚠ Missing fields: {', '.join(missing)}")
            return False
        
        if manifest.get('manifest_version') != 3:
            print(f"  ⚠ Manifest version should be 3, got {manifest.get('manifest_version')}")
            return False
        
        print(f"  ✓ All required fields present")
        print(f"  ✓ Manifest version: {manifest['manifest_version']}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error verifying manifest: {e}")
        return False

def verify_schools_json():
    """Verify schools.json has correct structure"""
    if not os.path.exists('schools.json'):
        return False
    
    try:
        with open('schools.json', 'r', encoding='utf-8') as f:
            schools = json.load(f)
        
        if not isinstance(schools, list):
            print(f"  ✗ schools.json should be an array")
            return False
        
        print(f"  ✓ Contains {len(schools)} schools")
        
        # Check structure of first school
        if len(schools) > 0:
            school = schools[0]
            if 'name' in school and 'abbreviations' in school:
                print(f"  ✓ Correct structure (name + abbreviations)")
            else:
                print(f"  ⚠ Schools missing 'name' or 'abbreviations' field")
                return False
        
        return True
        
    except Exception as e:
        print(f"  ✗ Error verifying schools.json: {e}")
        return False

def verify_image(filename):
    """Verify image file"""
    if not os.path.exists(filename):
        print(f"✗ {filename} - MISSING!")
        return False
    
    try:
        # Check if it's a PNG by reading magic number
        with open(filename, 'rb') as f:
            header = f.read(8)
            if header[:4] == b'\x89PNG':
                size = os.path.getsize(filename)
                print(f"✓ {filename} ({size} bytes) - Valid PNG")
                return True
            else:
                print(f"✗ {filename} - Not a valid PNG file")
                return False
    except Exception as e:
        print(f"✗ {filename} - ERROR: {e}")
        return False

def main():
    """Main verification function"""
    print("=" * 60)
    print("Instagram School-Based Follower Bot - Installation Verification")
    print("=" * 60)
    print()
    
    all_good = True
    
    # Check core files
    print("Checking core files...")
    print("-" * 60)
    
    core_files = [
        ('popup.html', 'text'),
        ('popup.css', 'text'),
        ('popup.js', 'text'),
        ('content.js', 'text'),
        ('background.js', 'text')
    ]
    
    for filename, _ in core_files:
        if not check_file(filename):
            all_good = False
    
    print()
    
    # Check JSON files
    print("Checking JSON files...")
    print("-" * 60)
    
    if verify_json('manifest.json'):
        verify_manifest()
    else:
        all_good = False
    
    print()
    
    if verify_json('schools.json'):
        verify_schools_json()
    else:
        all_good = False
    
    print()
    
    # Check icon files
    print("Checking icon files...")
    print("-" * 60)
    
    icon_files = ['icon16.png', 'icon48.png', 'icon128.png']
    for icon in icon_files:
        if not verify_image(icon):
            all_good = False
    
    print()
    
    # Check documentation
    print("Checking documentation...")
    print("-" * 60)
    
    doc_files = ['README.md', 'INSTALLATION.md']
    for doc in doc_files:
        check_file(doc)
    
    print()
    print("=" * 60)
    
    if all_good:
        print("✓ ALL CHECKS PASSED!")
        print()
        print("Your extension is ready to install!")
        print()
        print("Next steps:")
        print("1. Open Chrome and go to: chrome://extensions/")
        print("2. Enable 'Developer mode' (toggle in top-right)")
        print("3. Click 'Load unpacked'")
        print("4. Select this folder")
        print()
        print("For detailed instructions, see INSTALLATION.md")
        return 0
    else:
        print("✗ SOME CHECKS FAILED")
        print()
        print("Please fix the issues above before installing.")
        print()
        if not os.path.exists('icon16.png'):
            print("Tip: Run 'python3 create_icons.py' to create icon files")
        return 1

if __name__ == '__main__':
    sys.exit(main())


