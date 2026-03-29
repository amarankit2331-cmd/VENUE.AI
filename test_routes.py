from app import create_app
app = create_app()
with app.test_client() as c:
    with app.app_context():
        c.post('/auth/login', data={'username':'admin','password':'admin123'})
        routes = ['/search','/venue/1','/venue/5','/bookings/my','/notifications/','/admin/dashboard']
        all_ok = True
        for route in routes:
            r = c.get(route, follow_redirects=True)
            ok = r.status_code == 200
            if not ok: all_ok = False
            result = "OK" if ok else "FAIL"
            print("GET " + route + ": " + str(r.status_code) + " " + result)
        print()
        print("ALL PASSED" if all_ok else "SOME FAILED")
