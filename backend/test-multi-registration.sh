#!/bin/bash
echo "Registering PCODE 1..."
curl -X POST -H "Content-Type: application/json" -d '{"PCODE": 1, "VISIDATE": "2026-02-11"}' http://localhost:3000/api/mtswait
echo ""
echo "Registering PCODE 2..."
curl -X POST -H "Content-Type: application/json" -d '{"PCODE": 2, "VISIDATE": "2026-02-11"}' http://localhost:3000/api/mtswait
echo ""
echo "Registering PCODE 3..."
curl -X POST -H "Content-Type: application/json" -d '{"PCODE": 3, "VISIDATE": "2026-02-11"}' http://localhost:3000/api/mtswait
echo ""
