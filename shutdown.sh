#!/bin/bash

# Define the ports you want to shut down
PORTS=(3000 3001 3002)

echo "Searching for processes on ports: ${PORTS[@]}"

for PORT in "${PORTS[@]}"; do
    echo "--- Checking port $PORT ---"
    # Use netstat to find the PID for the specified port (works in Windows Command Prompt/Bash)
    # The command finds lines with the port number and the "LISTENING" state, then uses awk to extract the PID (5th token)
    PID=$(netstat -ano | grep LISTEN | grep ":${PORT} " | awk '{print $5}')

    if [ -z "$PID" ]; then
        echo "No process found on port $PORT"
    else
        echo "Found process with PID $PID on port $PORT. Attempting to terminate..."
        # Use taskkill to forcefully terminate the process by its PID
        # The /F flag forces termination
        taskkill /F /PID "$PID"
        if [ $? -eq 0 ]; then
            echo "Successfully terminated process $PID"
        else
            echo "Failed to terminate process $PID"
        fi
    fi
done

echo "--- Script finished ---"
