import cs304dbi as dbi
from datetime import datetime

def iterate_movie(conn): 
    '''iterates through movie table in wmdb. 
       returns python list of dicts (each dict is a column)
    ''' 
    curs = dbi.dict_cursor(conn)
    try: 
        curs.execute('select * from movie')
        movies = curs.fetchall()
        print("Successfully iterated over movie table.")
        return movies
    except: 
        curs.close()
        return "Error iterating over movie table."

def iterate_nm(conn, movies): 
    '''iterates through credit table in wmdb, gets list of names 
       associated with movie from dict of movies' tt, 
       returns python list of dicts with credits as list of names
    ''' 
    curs = dbi.dict_cursor(conn)
    try: 
        for movie in movies: 
            for attr in movie: 
                if movie[attr] == None: 
                    movie[attr] = "null"
            tt = movie['tt']
            curs.execute('''select c.nm, p.name, p.birthdate, p.addedby from credit c
                            inner join person p
                            on c.nm = p.nm
                            where tt=%s''', 
                            [tt])
            cast = curs.fetchall()

            movie['cast'] = []
            if len(cast) > 0: 
                for person in cast: 
                    movie['cast'].append(person['nm'])  
            
        print("Successfully inserted nm credits into movielist")
        return movies
    except ZeroDivisionError as e: 
        curs.close()
        return "Error iterating over credits table."

def iterate_people(conn): 
    curs = dbi.dict_cursor(conn)
    try: 
        curs.execute('''select distinct * from person p''')
        people = curs.fetchall()
        for person in people: 
            for key in person: 
                # set none to null -> global constant!
                if person[key] == None: 
                    person[key] = "null"

                # set datetime object to js-friendly object
                elif key == 'birthdate' and person[key] != None:
                    date = person[key].strftime('%m/%d/%Y')
                    person[key] = date    
        
        print("Successfully iterated over people table")
        return people
    except ZeroDivisionError as e: 
        curs.close()
        return "Error iterating over people table."

def iterate_staff(conn): 
    curs = dbi.dict_cursor(conn)
    try: 
        curs.execute('''select distinct * from staff''')
        staff = curs.fetchall()
        for person in staff: 
            for key in person: 
                # set none to null -> global constant!
                if person[key] == None: 
                    person[key] = "null"
        
        print("Successfully iterated over staff table")
        return staff
    except ZeroDivisionError as e: 
        curs.close()
        return "Error iterating over staff table."

def write_js(filename, movies, people, staff): 
    '''writes a js script file that, when run, inserts all items into mongodb
    takes in a python dictionary, doesnt return any values
    '''
    print('opening file')
    f = open(filename, 'w')
    print('writing first line')
    f.write('// beginning iteration of python dictionary\n')
    print('writing all lines')
    f.writelines(['"use strict";\n\n',
                  "const mongo = require('mongodb');\n",
                  "const url = 'mongodb://localhost:27017';\n\n",
                  "mongo.MongoClient.connect(url, function(err, db) {\n",
	              "\tif (err) throw err;\n\n",
	              "\tconsole.log('connected successfully to server');\n",
	              "\tconst dbo = db.db('wmdb');\n",
	              "\tconst movie = dbo.collection('movie');\n",
	              "\tconst people = dbo.collection('people');\n",
	              "\tconst staff = dbo.collection('staff');\n\n",
	              "\tvar numUpdates = 0;\n\n",
	              "\tfunction closeAtEnd() {\n",
		          "\t\tnumUpdates--;\n",
		          "\t\tif (numUpdates == 0) db.close();\n",
	              "\t};\n\n",
                  "\tvar movielist = ["])
    movies = ["\t" + str(m) for m in movies]
    joinedMovies = ',\n'.join(movies)
    f.write(joinedMovies)
    f.writelines(["]\n",
                  "\tvar stafflist = ["])
    staff = ["\t" + str(s) for s in staff]
    joinedStaff = ',\n'.join(staff)
    f.write(joinedStaff)
    f.writelines(["]\n",
                  "\tvar peoplelist = ["])
    people = ["\t" + str(p) for p in people]
    joinedPeople = ',\n'.join(people)
    f.write(joinedPeople)
    f.writelines(["]\n\n\n",
                  "\t// iterate over lists, replace 'null' values with js null object\n",
                  "\tmovielist.forEach((m) => {\n",
                  "\t\tfor (const k in m) {\n",
                  "\t\t\tm[k] = m[k] == 'null' ? null : m[k];\n",
                  "\t\t};\n",
                  "\t});\n",
                  "\tpeoplelist.forEach((p) => {\n",
                  "\t\tfor (const k in p) {\n",
                  "\t\t\tp[k] = p[k] == 'null' ? null : p[k];\n",
                  "\t\t};\n",
                  "\t});\n\n",
                  "\t// drop 'movie' collection if exists\n",
                  "\tmovie.drop(function(err, delOK) {\n",
                  "\t\tif (err) throw err;\n",
                  "\t\tif (delOK) {\n",
                  '\t\t\tconsole.log("movie collection deleted");\n',
                  "\t\t\t// then, upload movies\n",
                  "\t\t\tnumUpdates++;\n",
                  "\t\t\tmovie.insertMany(movielist, function(err, res) {\n",
                  "\t\t\t\tif (err) throw err;\n",
                  "\t\t\t\tconsole.log('successfully uploaded ' + res.insertedCount + ' movies to movie');\n",
                  "\t\t\t\tcloseAtEnd();\n",
                  "\t\t\t});\n",
                  "\t\t} else {\n",
                  '\t\t\tconsole.log("did not delete movie collection...");\n',
                  "\t\t\tcloseAtEnd();\n",
                  "\t\t};\n",
                  "\t});\n\n",
                  "\t// drop 'people' collection if exists\n",
                  "\tpeople.drop(function(err, delOK) {\n",
                  "\t\tif (err) throw err;\n",
                  "\t\tif (delOK) {\n",
                  '\t\t\tconsole.log("people collection deleted");\n',
                  "\t\t\t// then, insert people\n",
                  "\t\t\tnumUpdates++;\n",
                  "\t\t\tpeople.insertMany(peoplelist, function(err, res) {\n",
                  "\t\t\t\tif (err) throw err;\n",
                  "\t\t\t\tconsole.log('successfully uploaded ' + res.insertedCount + ' people to people');\n",
                  "\t\t\t\tcloseAtEnd();\n",
                  "\t\t\t});\n",
                  "\t\t} else {\n",
                  '\t\t\tconsole.log("did not delete people collection...");\n',
                  "\t\t\tcloseAtEnd();\n",
                  "\t\t};\n",
                  "\t});\n\n",
                  "\t// drop 'staff' collection if exists\n",
                  "\tstaff.drop(function(err, delOK) {\n",
                  "\t\tif (err) throw err;\n",
                  "\t\tif (delOK) {\n",
                  '\t\t\tconsole.log("staff collection deleted");\n',
                  "\t\t\t// then, insert people\n",
                  "\t\t\tnumUpdates++;\n",
                  "\t\t\tstaff.insertMany(stafflist, function(err, res) {\n",
                  "\t\t\t\tif (err) throw err;\n",
                  "\t\t\t\tconsole.log('successfully uploaded ' + res.insertedCount + ' members to staff');\n",
                  "\t\t\t\tcloseAtEnd();\n",
                  "\t\t\t});\n",
                  "\t\t} else {\n",
                  '\t\t\tconsole.log("did not delete staff collection...");\n',
                  "\t\t\tcloseAtEnd();\n",
                  "\t\t};\n",
                  "\t});\n",
                  "});"])
    print('successfully wrote to js file')

if __name__ == '__main__':
    dbi.cache_cnf()
    dbi.use('wmdb')
    conn = dbi.connect()

    movies = iterate_movie(conn)
    people = iterate_people(conn)
    staff = iterate_staff(conn)
    fullmovies = iterate_nm(conn, movies)

    # add some rogue, random attributes

    write_js('wmdbCreation.js', fullmovies, people, staff)