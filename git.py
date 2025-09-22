import subprocess

def run_git_commands():
    # Ask user for commit message
    commit_message = input("Enter commit message: ")

    try:
        # Stage all changes
        subprocess.run(["git", "add", "."], check=True)

        # Commit with the provided message
        subprocess.run(["git", "commit", "-m", commit_message], check=True)

        # Push to the main branch
        subprocess.run(["git", "push", "origin", "main"], check=True)

        print("\nGit commands executed successfully!")

    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing git commands: {e}")

if __name__ == "__main__":
    run_git_commands()
