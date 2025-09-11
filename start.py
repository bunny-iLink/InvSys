import subprocess
import os
import sys

# Paths to your project folders
FRONTEND_DIR = os.path.join(os.getcwd(), "frontend")
GATEWAY_DIR = os.path.join(os.getcwd(), "gateway")
SERVICES_DIR = os.path.join(os.getcwd(), "services")

processes = []

try:
    # Start Angular frontend
    print("🚀 Starting Angular frontend...")
    processes.append(subprocess.Popen(
        ["npm", "start"],
        cwd=FRONTEND_DIR,
        shell=True
    ))

    # Start Node.js gateway
    print("🚀 Starting Node.js gateway...")
    processes.append(subprocess.Popen(
        ["node", "index.js"],
        cwd=GATEWAY_DIR,
        shell=True
    ))

    # Start .NET services
    print("🚀 Starting .NET services...")
    for service in os.listdir(SERVICES_DIR):
        service_path = os.path.join(SERVICES_DIR, service)
        if os.path.isdir(service_path):
            print(f"   🔹 Starting {service}...")
            processes.append(subprocess.Popen(
                ["dotnet", "run"],
                cwd=service_path,
                shell=True
            ))

    print("\n✅ All services started. Press Ctrl+C to stop.\n")

    # Keep script alive until interrupted
    for p in processes:
        p.wait()

except KeyboardInterrupt:
    print("\n🛑 Stopping all processes...")
    for p in processes:
        p.terminate()
    sys.exit(0)
