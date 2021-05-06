**Ereserve**

An Equipment Reservation System for WordPress

This is a bare bones equipment rental system that works as a WordPress
plugin. At this point it's very specific to Community TV's needs. To see
it in operation visit:
[[https://satellite.communitytv.org/equipment-reservations/]{.ul}](https://satellite.communitytv.org/equipment-reservations/)
If you have questions or want to implement this on your website please
contact me.

**Here are the 4 needed pages' contents**:
 | Short Code                      | Page Purpose                                                                      | Status  |
|---------------------------------|-----------------------------------------------------------------------------------|---------|
| \[e_reserve\]                   | Main reservation system page.                                                     | Public  |
| \[e_reserve action=\"admin\"\]  | Reservation administration page.                                                  | Private |
| \[e_reserve action=\"thanks\"\] | Thank you page for reservations.                                                  | Public  |
| \[e_reserve action=\"equip\"\]  | Where system administration, such as adding new equipment and categories happens. | Private |
  --------------------------------- ----------------------------------------------------------------------------------- ---------

**Setup needed ahead of time**:

In the database create the following tables (table structure follows):

-   Categories

-   frequently_rented_with

-   Items

-   reservations

-   reservation_detail

-   Status

-   Types

In the main directory you will need a file named 'dbconvars.php' with
the following content:
```
    <?php
    $dbhost = "localhost";
    $dbuser = "user_name_for DB";
    $dbpwd = "user_password";
    $dbname = "your_db_name";
    ?>
```
In addition, this plugin communicates with Deskworks, a coworking
administration software package. The APIs in the api directory include
files that are linked to the appropriate API directory defined in a
separate file 'satvars.php' which contains:
```
    <?php
    $apiUrl = "https://your_deskwords_url.com";
    $pword = "your_deskworks_password";
    $uname = "your_deskworks_user_name";
    ?>
```
Please see the README.pdf file in this directory for more information about the table structure.
