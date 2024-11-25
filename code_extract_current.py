#!/usr/local/bin/python3

import os
import inquirer
import pyperclip
from collections import Counter

def display_ascii_title():
    title = r"""
  _______  
 /       \
/   >     \
\_________/
    """
    print(title)

def confirm_folder_path():
    current_path = os.getcwd()
    print(f"\nCurrent directory: {current_path}")
    
    questions = [
        inquirer.List('path_choice',
                     message="Would you like to use this directory or enter a different path?",
                     choices=['Use current directory', 'Enter different path'])
    ]
    
    answers = inquirer.prompt(questions)
    
    if answers['path_choice'] == 'Use current directory':
        return current_path
    else:
        while True:
            folder_path = input("Input folder path: ")
            if os.path.isdir(folder_path):
                return folder_path
            else:
                print("Invalid folder path. Please try again.")

def get_file_types_in_repository(folder_path, exclusions=None):
    """Scan the repository and return all unique file extensions with their counts."""
    file_types = Counter()
    
    for root, dirs, files in os.walk(folder_path):
        # Skip excluded directories
        if exclusions:
            dirs[:] = [d for d in dirs if os.path.relpath(os.path.join(root, d), folder_path) not in exclusions]
            
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, folder_path)
            
            # Skip excluded files
            if exclusions and (relative_path in exclusions or os.path.dirname(relative_path) in exclusions):
                continue
                
            # Get file extension
            _, ext = os.path.splitext(file)
            if ext:  # Only count files with extensions
                ext = ext[1:]  # Remove the leading dot
                if ext:  # Ensure it's not an empty string
                    file_types[ext] += 1
                    
    return file_types

def select_file_types(folder_path, exclusions=None):
    """Let user select from detected file types in the repository."""
    print("\nScanning repository for file types...")
    file_types = get_file_types_in_repository(folder_path, exclusions)
    
    if not file_types:
        print("No files with extensions found in the repository.")
        return []
        
    # Create choices list with file counts
    choices = [
        f"{ext} ({count} files)" 
        for ext, count in sorted(file_types.items(), key=lambda x: (-x[1], x[0]))
    ]
    
    questions = [
        inquirer.Checkbox('file_types',
                         message="Select file types to include",
                         choices=choices,
                         default=choices)  # All types selected by default
    ]
    
    answers = inquirer.prompt(questions)
    
    # Extract just the extension from the selected choices
    selected_types = [choice.split()[0] for choice in answers['file_types']]
    
    print(f"\nSelected file types: {', '.join(selected_types)}")
    return selected_types

def list_files(folder_path, file_types, exclusions=None):
    """List all files matching the selected types and not in excluded paths."""
    folder_structure = []
    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if os.path.relpath(os.path.join(root, d), folder_path) not in exclusions]
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, folder_path)

            if exclusions and (relative_path in exclusions or os.path.dirname(relative_path) in exclusions):
                continue

            if any(file.endswith(f".{ext}") for ext in file_types):
                folder_structure.append(relative_path)

    return sorted(folder_structure)

def display_folder_structure(folder_structure):
    print("\n===== Included Files =====")
    for file in folder_structure:
        print(file)
    print("\n==========================\n")

def generate_plain_text_output(folder_structure, folder_path, file_types, exclusions):
    output = "===== Project Folder Structure =====\n\n"
    output += "\n".join(folder_structure)
    output += "\n\n===== Project Files =====\n\n"

    for file_path in folder_structure:
        full_file_path = os.path.join(folder_path, file_path)
        output += f"{file_path}\n\n"
        try:
            with open(full_file_path, 'r', encoding='utf-8') as f:
                output += f.read() + "\n\n"
        except Exception as e:
            output += f"Error reading file: {str(e)}\n\n"

    return output

def generate_xml_output(folder_structure, folder_path, file_types, exclusions):
    output = "<Project>\n"

    output += "  <FolderStructure>\n"
    for file_path in folder_structure:
        directory = os.path.dirname(file_path)
        file = os.path.basename(file_path)
        output += f'    <Directory name="{directory}">\n'
        output += f"      <File>{file}</File>\n"
        output += "    </Directory>\n"
    output += "  </FolderStructure>\n"

    output += "  <FilesContent>\n"
    for file_path in folder_structure:
        full_file_path = os.path.join(folder_path, file_path)
        output += f'    <File name="{os.path.basename(file_path)}" path="{file_path}">\n'
        output += "      <![CDATA[\n"
        try:
            with open(full_file_path, 'r', encoding='utf-8') as f:
                output += f.read()
        except Exception as e:
            output += f"Error reading file: {str(e)}"
        output += "\n      ]]>\n"
        output += "    </File>\n"
    output += "  </FilesContent>\n"

    output += "</Project>"
    return output

def exclude_unrelated_files():
    unrelated_folders = ['.next', 'node_modules', 'package-lock.json', '.git', 'dist', 'build']
    questions = [
        inquirer.Confirm('exclude_unrelated', 
                        message="Exclude common dependency folders (.next, node_modules, .git, etc)?", 
                        default=True)
    ]
    answers = inquirer.prompt(questions)
    if answers['exclude_unrelated']:
        return set(unrelated_folders)
    return set()

def exclude_additional_files_or_folders(folder_structure):
    if not folder_structure:
        print("No files to exclude.")
        return set()
    
    # Just use the folder_structure directly as it already contains only files
    sorted_choices = sorted(folder_structure, key=str.lower)
    
    questions = [
        inquirer.Checkbox('exclusions',
                         message="Select files to exclude",
                         choices=sorted_choices)
    ]
    answers = inquirer.prompt(questions)
    return set(answers['exclusions'])

def copy_to_clipboard(output):
    try:
        pyperclip.copy(output)
        print("Output copied to clipboard.")
    except Exception as e:
        print(f"Error copying to clipboard: {str(e)}")
        print("Please manually copy the output above.")

def count_lines_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for line in f if line.strip())  # Count non-empty lines
    except Exception as e:
        return 0

def display_extraction_summary(folder_structure, folder_path):
    total_lines = 0
    print("\nExtraction Summary:")
    print("=" * 50)
    
    # Get max filename length for pretty formatting
    max_length = max(len(file) for file in folder_structure)
    
    # Process each file and display stats
    for file_path in folder_structure:
        full_path = os.path.join(folder_path, file_path)
        lines = count_lines_in_file(full_path)
        total_lines += lines
        print(f"{file_path:<{max_length}} : {lines:>4} lines of code")
    
    print("=" * 50)
    print(f"Total: {len(folder_structure)} files, {total_lines} lines of code")

def copy_to_clipboard(output, folder_structure, folder_path):
    try:
        pyperclip.copy(output)
        print("\nOutput copied to clipboard.")
        display_extraction_summary(folder_structure, folder_path)
    except Exception as e:
        print(f"Error copying to clipboard: {str(e)}")
        print("Please manually copy the output above.")

def main():
    display_ascii_title()
    folder_path = confirm_folder_path()
    
    # First get exclusions to avoid scanning unnecessary files
    exclusions = exclude_unrelated_files()
    
    while True:
        file_types = select_file_types(folder_path, exclusions)
        
        if not file_types:
            print("No file types selected. Please try again.")
            continue
            
        folder_structure = list_files(folder_path, file_types, exclusions)
        
        if not folder_structure:
            print("No matching files found with the selected criteria.")
            questions = [
                inquirer.Confirm('retry', message="Would you like to try different selections?", default=True)
            ]
            answers = inquirer.prompt(questions)
            if answers['retry']:
                continue
            else:
                print("Exiting script.")
                return
        
        questions = [
            inquirer.Confirm('exclude_more', message="Exclude more files/folders?", default=False)
        ]
        answers = inquirer.prompt(questions)
        if answers['exclude_more']:
            additional_exclusions = exclude_additional_files_or_folders(folder_structure)
            if additional_exclusions:
                exclusions.update(additional_exclusions)
                folder_structure = list_files(folder_path, file_types, exclusions)
            
        display_folder_structure(folder_structure)
        
        questions = [
            inquirer.Confirm('proceed', message="Proceed with the current collection?", default=True)
        ]
        answers = inquirer.prompt(questions)
        if answers['proceed']:
            break

    questions = [
        inquirer.List('output_format',
                      message="Select output format",
                      choices=['Plain Text', 'XML'])
    ]
    answers = inquirer.prompt(questions)
    output_format = answers['output_format']

    if output_format == 'Plain Text':
        output = generate_plain_text_output(folder_structure, folder_path, file_types, exclusions)
    else:
        output = generate_xml_output(folder_structure, folder_path, file_types, exclusions)

    print("\nGenerated Output:")
    print("=" * 40)
    print(output)
    print("=" * 40)

    
    while True:
        questions = [
            inquirer.Confirm('copy', message="Copy to clipboard?", default=True)
        ]
        answers = inquirer.prompt(questions)
        if answers['copy']:
            copy_to_clipboard(output, folder_structure, folder_path)

        questions = [
            inquirer.Confirm('repeat', message="Process another set of files from the same codebase?", default=False)
        ]
        answers = inquirer.prompt(questions)
        if not answers['repeat']:
            print("Exiting script.")
            break

if __name__ == "__main__":
    main()